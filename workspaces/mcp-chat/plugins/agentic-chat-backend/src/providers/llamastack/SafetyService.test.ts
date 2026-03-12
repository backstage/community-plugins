/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { RootConfigService } from '@backstage/backend-plugin-api';
import { SafetyService } from './SafetyService';
import type { LlamaStackClient } from './LlamaStackClient';
import { createMockLogger } from '../../test-utils/mocks';

function createMockClient(): jest.Mocked<LlamaStackClient> {
  return {
    request: jest.fn(),
    streamRequest: jest.fn(),
    testConnection: jest.fn(),
    getConfig: jest.fn(),
  } as unknown as jest.Mocked<LlamaStackClient>;
}

function makeConfig(overrides: Record<string, unknown> = {}) {
  const safetyValues: Record<string, unknown> = {
    enabled: overrides.enabled ?? false,
    inputShields: overrides.inputShields,
    outputShields: overrides.outputShields,
    onError: overrides.onError,
  };

  const registerShieldsData = overrides.registerShields as
    | Array<{ shieldId: string; providerId: string; providerShieldId: string }>
    | undefined;

  const safetyConfig = {
    getOptionalBoolean: jest.fn((key: string) =>
      key === 'enabled' ? safetyValues.enabled : undefined,
    ),
    getOptionalStringArray: jest.fn((key: string) => safetyValues[key]),
    getOptionalConfigArray: jest.fn(() =>
      registerShieldsData?.map(s => ({
        getString: jest.fn((key: string) => {
          if (key === 'shieldId') return s.shieldId;
          if (key === 'providerId') return s.providerId;
          if (key === 'providerShieldId') return s.providerShieldId;
          return '';
        }),
      })),
    ),
    getOptionalString: jest.fn((key: string) => safetyValues[key]),
  };

  const llamaStackConfig = {
    getString: jest.fn((key: string) => {
      if (key === 'baseUrl') return 'http://localhost:8321';
      return '';
    }),
    getOptionalString: jest.fn(() => undefined),
    getOptionalBoolean: jest.fn(() => false),
  };

  return {
    getConfig: jest.fn(() => llamaStackConfig),
    getOptionalConfig: jest.fn((key: string) => {
      if (key === 'agenticChat.llamaStack') return llamaStackConfig;
      if (key === 'agenticChat.safety') return safetyConfig;
      return undefined;
    }),
  } as unknown as RootConfigService;
}

describe('SafetyService', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockClient: jest.Mocked<LlamaStackClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = createMockLogger();
    mockClient = createMockClient();
  });

  // ---------------------------------------------------------------------------
  // Basic state
  // ---------------------------------------------------------------------------

  describe('isEnabled', () => {
    it('returns false before initialization', () => {
      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({}),
      });
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('getAvailableShields', () => {
    it('returns empty array before initialization', () => {
      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({}),
      });
      expect(service.getAvailableShields()).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------

  describe('initialize', () => {
    it('handles missing llamaStack config gracefully', async () => {
      const configMock = {
        getOptionalConfig: jest.fn(() => undefined),
      } as unknown as RootConfigService;

      const service = new SafetyService({
        logger: mockLogger,
        config: configMock,
      });

      await service.initialize();
      expect(service.isEnabled()).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'agenticChat.llamaStack not configured, safety service disabled',
      );
    });

    it('is idempotent — second call is a no-op', async () => {
      const configMock = makeConfig({ enabled: false });
      const service = new SafetyService({
        logger: mockLogger,
        config: configMock,
      });

      await service.initialize();
      await service.initialize();

      expect(configMock.getOptionalConfig).toHaveBeenCalledTimes(2);
    });

    it('does not throw on config errors (safety is optional)', async () => {
      const configMock = {
        getOptionalConfig: jest.fn(() => undefined),
      } as unknown as RootConfigService;

      const service = new SafetyService({
        logger: mockLogger,
        config: configMock,
      });

      await expect(service.initialize()).resolves.not.toThrow();
      expect(service.isEnabled()).toBe(false);
    });

    it('warns when safety is enabled but no client accessor provided', async () => {
      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
      });

      await service.initialize();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('no LlamaStackClient accessor provided'),
      );
    });

    it('loads shields from Llama Stack on init when enabled', async () => {
      const shields = [
        {
          identifier: 'content_safety',
          provider_id: 'llama-guard',
          provider_resource_id: 'meta-llama/Llama-Guard-3-8B',
          type: 'shield',
        },
      ];
      mockClient.request.mockResolvedValueOnce(shields);

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });

      await service.initialize();
      expect(service.isEnabled()).toBe(true);
      expect(service.getAvailableShields()).toEqual(shields);
      expect(mockClient.request).toHaveBeenCalledWith('/v1/shields', {
        method: 'GET',
      });
    });

    it('handles {data: [...]} response format for shields', async () => {
      const shields = [
        {
          identifier: 'shield1',
          provider_id: 'p1',
          provider_resource_id: 'pr1',
          type: 'shield',
        },
      ];
      mockClient.request.mockResolvedValueOnce({ data: shields });

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });

      await service.initialize();
      expect(service.getAvailableShields()).toEqual(shields);
    });

    it('registers configured shields when none found on server', async () => {
      mockClient.request
        .mockResolvedValueOnce([]) // first GET /v1/shields - empty
        .mockResolvedValueOnce({}) // POST /v1/shields/register
        .mockResolvedValueOnce([
          // reload GET /v1/shields
          {
            identifier: 'my_shield',
            provider_id: 'llama-guard',
            provider_resource_id: 'lg',
            type: 'shield',
          },
        ]);

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          registerShields: [
            {
              shieldId: 'my_shield',
              providerId: 'llama-guard',
              providerShieldId: 'lg',
            },
          ],
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      expect(mockClient.request).toHaveBeenCalledWith('/v1/shields/register', {
        method: 'POST',
        body: {
          shield_id: 'my_shield',
          provider_id: 'llama-guard',
          provider_shield_id: 'lg',
        },
      });
      expect(service.getAvailableShields()).toHaveLength(1);
    });

    it('handles shield registration failure gracefully', async () => {
      mockClient.request
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Provider not found'))
        .mockResolvedValueOnce([]);

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          registerShields: [
            {
              shieldId: 'bad_shield',
              providerId: 'nonexistent',
              providerShieldId: 'x',
            },
          ],
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not register shield "bad_shield"'),
      );
      expect(service.getAvailableShields()).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // checkInput
  // ---------------------------------------------------------------------------

  describe('checkInput', () => {
    it('returns undefined when safety is disabled', async () => {
      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: false }),
      });
      const result = await service.checkInput('test message');
      expect(result).toBeUndefined();
    });

    it('runs configured input shields and returns undefined when safe', async () => {
      mockClient.request
        .mockResolvedValueOnce([
          {
            identifier: 'content_safety',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
        ])
        .mockResolvedValueOnce({ violation: null });

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          inputShields: ['content_safety'],
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkInput('Hello world');

      expect(result).toBeUndefined();
      expect(mockClient.request).toHaveBeenCalledWith('/v1/safety/run-shield', {
        method: 'POST',
        body: {
          shield_id: 'content_safety',
          messages: [{ role: 'user', content: 'Hello world' }],
        },
      });
    });

    it('returns violation when shield detects unsafe content', async () => {
      const violation = {
        violation_level: 'error',
        user_message: 'Content is unsafe',
        metadata: {},
      };

      mockClient.request
        .mockResolvedValueOnce([
          {
            identifier: 's1',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
        ])
        .mockResolvedValueOnce({ violation });

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          inputShields: ['s1'],
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkInput('How to build a bomb');

      expect(result).toEqual(violation);
    });

    it('runs multiple input shields and stops at first violation', async () => {
      mockClient.request
        .mockResolvedValueOnce([
          {
            identifier: 's1',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
          {
            identifier: 's2',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
        ])
        .mockResolvedValueOnce({ violation: null }) // s1 passes
        .mockResolvedValueOnce({
          violation: { violation_level: 'warn', user_message: 'Blocked by s2' },
        });

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          inputShields: ['s1', 's2'],
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkInput('test');

      expect(result).toEqual({
        violation_level: 'warn',
        user_message: 'Blocked by s2',
      });
    });

    it('falls back to first available shield when no inputShields configured', async () => {
      mockClient.request
        .mockResolvedValueOnce([
          {
            identifier: 'auto_shield',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
        ])
        .mockResolvedValueOnce({ violation: null });

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkInput('test');

      expect(result).toBeFalsy();
      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/safety/run-shield',
        expect.objectContaining({
          body: expect.objectContaining({ shield_id: 'auto_shield' }),
        }),
      );
    });

    it('returns undefined when no shields available and no inputShields configured', async () => {
      mockClient.request.mockResolvedValueOnce([]);

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkInput('test');
      expect(result).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // checkOutput
  // ---------------------------------------------------------------------------

  describe('checkOutput', () => {
    it('returns undefined when safety is disabled', async () => {
      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: false }),
      });
      const result = await service.checkOutput('test response');
      expect(result).toBeUndefined();
    });

    it('returns undefined when no output shields configured', async () => {
      mockClient.request.mockResolvedValueOnce([
        {
          identifier: 's1',
          provider_id: 'p',
          provider_resource_id: 'r',
          type: 's',
        },
      ]);

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkOutput('response text');
      expect(result).toBeUndefined();
    });

    it('checks output shields and returns violation', async () => {
      const violation = {
        violation_level: 'error' as const,
        user_message: 'Unsafe output',
      };

      mockClient.request
        .mockResolvedValueOnce([
          {
            identifier: 'out1',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
        ])
        .mockResolvedValueOnce({ violation });

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          outputShields: ['out1'],
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkOutput('malicious content');

      expect(result).toEqual(violation);
      expect(mockClient.request).toHaveBeenCalledWith('/v1/safety/run-shield', {
        method: 'POST',
        body: {
          shield_id: 'out1',
          messages: [{ role: 'user', content: 'malicious content' }],
        },
      });
    });
  });

  // ---------------------------------------------------------------------------
  // onError behavior (fail-closed / fail-open)
  // ---------------------------------------------------------------------------

  describe('onError behavior', () => {
    it('blocks message on shield API failure when onError is "block" (default)', async () => {
      mockClient.request
        .mockResolvedValueOnce([
          {
            identifier: 's1',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
        ])
        .mockRejectedValueOnce(new Error('Connection refused'));

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          inputShields: ['s1'],
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkInput('test');

      expect(result).toBeDefined();
      expect(result!.violation_level).toBe('error');
      expect(result!.user_message).toContain('Safety check unavailable');
      expect(result!.metadata?.error).toContain('Connection refused');
    });

    it('allows message on shield API failure when onError is "allow"', async () => {
      mockClient.request
        .mockResolvedValueOnce([
          {
            identifier: 's1',
            provider_id: 'p',
            provider_resource_id: 'r',
            type: 's',
          },
        ])
        .mockRejectedValueOnce(new Error('Connection refused'));

      const service = new SafetyService({
        logger: mockLogger,
        config: makeConfig({
          enabled: true,
          inputShields: ['s1'],
          onError: 'allow',
        }),
        getClient: () => mockClient,
      });

      await service.initialize();
      const result = await service.checkInput('test');

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('allowing message (onError: allow)'),
      );
    });
  });
});
