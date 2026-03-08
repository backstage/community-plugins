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
import type { LoggerService } from '@backstage/backend-plugin-api';
import type { LlamaStackConfig } from '../../types';
import { ClientManager } from './ClientManager';

function createMockLogger(): Record<string, jest.Mock> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

function createConfig(
  overrides: Partial<LlamaStackConfig> = {},
): LlamaStackConfig {
  return {
    baseUrl: 'http://localhost:8321',
    model: 'test-model',
    vectorStoreIds: [],
    vectorStoreName: 'default',
    embeddingModel: 'all-MiniLM-L6-v2',
    embeddingDimension: 384,
    chunkingStrategy: 'auto',
    maxChunkSizeTokens: 800,
    chunkOverlapTokens: 400,
    ...overrides,
  };
}

describe('ClientManager', () => {
  let mockLogger: Record<string, jest.Mock>;
  let manager: ClientManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = createMockLogger();
    manager = new ClientManager(mockLogger as unknown as LoggerService);
  });

  describe('initial state', () => {
    it('has no client before first getClient call', () => {
      expect(manager.hasClient()).toBe(false);
    });

    it('getExistingClient throws when no client exists', () => {
      expect(() => manager.getExistingClient()).toThrow(
        'ClientManager has no client',
      );
    });
  });

  describe('getClient()', () => {
    it('creates a client on first call', () => {
      const config = createConfig();
      const client = manager.getClient(config);

      expect(client).toBeDefined();
      expect(manager.hasClient()).toBe(true);
    });

    it('returns the same client for identical config', () => {
      const config = createConfig();
      const client1 = manager.getClient(config);
      const client2 = manager.getClient(config);

      expect(client1).toBe(client2);
    });

    it('returns the same client when non-identity fields change', () => {
      const client1 = manager.getClient(createConfig({ model: 'model-A' }));
      const client2 = manager.getClient(createConfig({ model: 'model-B' }));

      expect(client1).toBe(client2);
    });

    it('returns the same client when vectorStoreIds change', () => {
      const client1 = manager.getClient(
        createConfig({ vectorStoreIds: ['vs-1'] }),
      );
      const client2 = manager.getClient(
        createConfig({ vectorStoreIds: ['vs-2', 'vs-3'] }),
      );

      expect(client1).toBe(client2);
    });

    it('creates a new client when baseUrl changes', () => {
      const client1 = manager.getClient(
        createConfig({ baseUrl: 'http://host-a:8321' }),
      );
      const client2 = manager.getClient(
        createConfig({ baseUrl: 'http://host-b:8321' }),
      );

      expect(client1).not.toBe(client2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('identity changed'),
      );
    });

    it('creates a new client when token changes', () => {
      const client1 = manager.getClient(createConfig({ token: 'token-A' }));
      const client2 = manager.getClient(createConfig({ token: 'token-B' }));

      expect(client1).not.toBe(client2);
    });

    it('creates a new client when token is added', () => {
      const client1 = manager.getClient(createConfig());
      const client2 = manager.getClient(createConfig({ token: 'new-token' }));

      expect(client1).not.toBe(client2);
    });

    it('creates a new client when token is removed', () => {
      const client1 = manager.getClient(createConfig({ token: 'old-token' }));
      const client2 = manager.getClient(createConfig({ token: undefined }));

      expect(client1).not.toBe(client2);
    });

    it('creates a new client when skipTlsVerify changes', () => {
      const client1 = manager.getClient(createConfig({ skipTlsVerify: false }));
      const client2 = manager.getClient(createConfig({ skipTlsVerify: true }));

      expect(client1).not.toBe(client2);
    });

    it('does not log identity change on first creation', () => {
      manager.getClient(createConfig());

      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('identity changed'),
      );
    });
  });

  describe('getExistingClient()', () => {
    it('returns the client after getClient has been called', () => {
      const config = createConfig();
      const created = manager.getClient(config);
      const existing = manager.getExistingClient();

      expect(existing).toBe(created);
    });

    it('returns the latest client after identity change', () => {
      manager.getClient(createConfig({ baseUrl: 'http://host-a:8321' }));
      const latest = manager.getClient(
        createConfig({ baseUrl: 'http://host-b:8321' }),
      );
      const existing = manager.getExistingClient();

      expect(existing).toBe(latest);
    });
  });

  describe('invalidate()', () => {
    it('drops the cached client', () => {
      manager.getClient(createConfig());
      expect(manager.hasClient()).toBe(true);

      manager.invalidate();
      expect(manager.hasClient()).toBe(false);
    });

    it('causes getExistingClient to throw', () => {
      manager.getClient(createConfig());
      manager.invalidate();

      expect(() => manager.getExistingClient()).toThrow(
        'ClientManager has no client',
      );
    });

    it('causes next getClient to create a fresh instance', () => {
      const config = createConfig();
      const client1 = manager.getClient(config);
      manager.invalidate();
      const client2 = manager.getClient(config);

      expect(client1).not.toBe(client2);
    });
  });

  describe('client configuration', () => {
    it('created client has the correct baseUrl', () => {
      const config = createConfig({ baseUrl: 'http://my-llama:9999' });
      const client = manager.getClient(config);

      expect(client.getConfig().baseUrl).toBe('http://my-llama:9999');
    });

    it('re-created client uses the new config', () => {
      manager.getClient(createConfig({ baseUrl: 'http://old:8321' }));
      const newClient = manager.getClient(
        createConfig({ baseUrl: 'http://new:8321', token: 'fresh-token' }),
      );

      expect(newClient.getConfig().baseUrl).toBe('http://new:8321');
      expect(newClient.getConfig().token).toBe('fresh-token');
    });
  });
});
