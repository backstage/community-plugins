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
import { EvaluationService } from './EvaluationService';
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
  const evalValues: Record<string, unknown> = {
    enabled: overrides.enabled ?? false,
    scoringFunctions: overrides.scoringFunctions,
    minScoreThreshold: overrides.minScoreThreshold,
    onError: overrides.onError,
  };

  const evalConfig = {
    getOptionalBoolean: jest.fn((key: string) =>
      key === 'enabled' ? evalValues.enabled : undefined,
    ),
    getOptionalStringArray: jest.fn((key: string) => evalValues[key]),
    getOptionalNumber: jest.fn((key: string) => evalValues[key]),
    getOptionalString: jest.fn((key: string) => evalValues[key]),
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
    getOptionalConfig: jest.fn((key: string) => {
      if (key === 'agenticChat.llamaStack') return llamaStackConfig;
      if (key === 'agenticChat.evaluation') return evalConfig;
      return undefined;
    }),
  } as unknown as RootConfigService;
}

describe('EvaluationService', () => {
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
      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({}),
      });
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('getAvailableScoringFunctions', () => {
    it('returns empty array before initialization', () => {
      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({}),
      });
      expect(service.getAvailableScoringFunctions()).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------

  describe('initialize', () => {
    it('handles missing llamaStack config gracefully', async () => {
      const service = new EvaluationService({
        logger: mockLogger,
        config: {
          getOptionalConfig: jest.fn(() => undefined),
        } as unknown as RootConfigService,
      });

      await service.initialize();
      expect(service.isEnabled()).toBe(false);
    });

    it('is idempotent', async () => {
      const config = makeConfig({ enabled: false });
      const service = new EvaluationService({
        logger: mockLogger,
        config,
      });

      await service.initialize();
      await service.initialize();
      expect(config.getOptionalConfig).toHaveBeenCalledTimes(2);
    });

    it('warns when enabled but no client accessor provided', async () => {
      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
      });

      await service.initialize();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('no LlamaStackClient accessor provided'),
      );
    });

    it('loads scoring functions on init when enabled', async () => {
      const fns = [
        {
          identifier: 'basic::subset_of',
          provider_id: 'basic',
          provider_resource_id: '',
          type: 'scoring',
          description: 'Subset match',
        },
      ];
      mockClient.request.mockResolvedValueOnce(fns);

      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });

      await service.initialize();
      expect(service.isEnabled()).toBe(true);
      expect(service.getAvailableScoringFunctions()).toEqual(fns);
      expect(mockClient.request).toHaveBeenCalledWith('/v1/scoring-functions', {
        method: 'GET',
      });
    });

    it('handles {data: [...]} response format', async () => {
      const fns = [
        {
          identifier: 'fn1',
          provider_id: 'p',
          provider_resource_id: '',
          type: 's',
        },
      ];
      mockClient.request.mockResolvedValueOnce({ data: fns });

      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });

      await service.initialize();
      expect(service.getAvailableScoringFunctions()).toEqual(fns);
    });
  });

  // ---------------------------------------------------------------------------
  // scoreResponse - field names and scoring
  // ---------------------------------------------------------------------------

  describe('scoreResponse', () => {
    async function createEnabledService(
      configOverrides: Record<string, unknown> = {},
    ) {
      const fns = [
        {
          identifier: 'basic::subset_of',
          provider_id: 'basic',
          provider_resource_id: '',
          type: 'scoring',
        },
      ];
      mockClient.request.mockResolvedValueOnce(fns);

      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true, ...configOverrides }),
        getClient: () => mockClient,
      });

      await service.initialize();
      return service;
    }

    it('returns undefined when evaluation is disabled', async () => {
      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: false }),
      });
      const result = await service.scoreResponse('q', 'a');
      expect(result).toBeUndefined();
    });

    it('sends correct Llama Stack field names (input_query, generated_answer)', async () => {
      const service = await createEnabledService();

      mockClient.request.mockResolvedValueOnce({
        results: {
          'basic::subset_of': {
            score_rows: [{ score: 1.0 }],
          },
        },
      });

      await service.scoreResponse('What is 2+2?', '4');

      const scoreCall = mockClient.request.mock.calls.find(
        c => c[0] === '/v1/scoring/score',
      );
      expect(scoreCall).toBeDefined();

      const body = (scoreCall![1] as { body: Record<string, unknown> }).body;
      expect((body.input_rows as Record<string, unknown>[])[0]).toEqual({
        input_query: 'What is 2+2?',
        generated_answer: '4',
      });
      expect(
        (body.input_rows as Record<string, unknown>[])[0],
      ).not.toHaveProperty('input');
      expect(
        (body.input_rows as Record<string, unknown>[])[0],
      ).not.toHaveProperty('generated_output');
    });

    it('includes expected_answer when provided', async () => {
      const service = await createEnabledService();

      mockClient.request.mockResolvedValueOnce({
        results: { 'basic::subset_of': { score_rows: [{ score: 1.0 }] } },
      });

      await service.scoreResponse('What is 2+2?', '4', undefined, '4');

      const scoreCall = mockClient.request.mock.calls.find(
        c => c[0] === '/v1/scoring/score',
      );
      const body = (
        scoreCall![1] as {
          body: { input_rows: Array<{ expected_answer?: string }> };
        }
      ).body;
      expect(body.input_rows[0].expected_answer).toBe('4');
    });

    it('includes context when provided', async () => {
      const service = await createEnabledService();

      mockClient.request.mockResolvedValueOnce({
        results: { 'basic::subset_of': { score_rows: [{ score: 0.8 }] } },
      });

      await service.scoreResponse('q', 'a', ['doc1', 'doc2']);

      const scoreCall = mockClient.request.mock.calls.find(
        c => c[0] === '/v1/scoring/score',
      );
      const body = (
        scoreCall![1] as { body: { input_rows: Array<{ context?: string }> } }
      ).body;
      expect(body.input_rows[0].context).toBe('doc1\ndoc2');
    });

    it('parses direct score format (basic::subset_of style)', async () => {
      const service = await createEnabledService();

      mockClient.request.mockResolvedValueOnce({
        results: {
          'basic::subset_of': {
            score_rows: [{ score: 1.0 }],
            aggregated_results: {
              accuracy: { accuracy: 1.0, num_correct: 1, num_total: 1 },
            },
          },
        },
      });

      const result = await service.scoreResponse('What is 2+2?', '4');

      expect(result).toBeDefined();
      expect(result!.overallScore).toBe(1.0);
      expect(result!.scores['basic::subset_of']).toBe(1.0);
      expect(result!.qualityLevel).toBe('excellent');
      expect(result!.passedThreshold).toBe(true);
    });

    it('parses nested scores format', async () => {
      const service = await createEnabledService();

      mockClient.request.mockResolvedValueOnce({
        results: {
          'basic::subset_of': {
            score_rows: [
              {
                scores: {
                  accuracy: { score_type: 'float', value: 0.8 },
                },
              },
            ],
          },
        },
      });

      const result = await service.scoreResponse('q', 'a');

      expect(result!.overallScore).toBe(0.8);
      expect(result!.scores['basic::subset_of:accuracy']).toBe(0.8);
    });

    it('computes average score across multiple functions', async () => {
      const fns = [
        {
          identifier: 'fn1',
          provider_id: 'p',
          provider_resource_id: '',
          type: 's',
        },
        {
          identifier: 'fn2',
          provider_id: 'p',
          provider_resource_id: '',
          type: 's',
        },
      ];
      mockClient.request.mockResolvedValueOnce(fns);

      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });
      await service.initialize();

      mockClient.request.mockResolvedValueOnce({
        results: {
          fn1: { score_rows: [{ score: 1.0 }] },
          fn2: { score_rows: [{ score: 0.5 }] },
        },
      });

      const result = await service.scoreResponse('q', 'a');

      expect(result!.overallScore).toBe(0.75);
      expect(result!.qualityLevel).toBe('good');
    });

    it('uses configured scoring functions instead of all available', async () => {
      const service = await createEnabledService({
        scoringFunctions: ['specific::fn'],
      });

      mockClient.request.mockResolvedValueOnce({
        results: { 'specific::fn': { score_rows: [{ score: 0.9 }] } },
      });

      await service.scoreResponse('q', 'a');

      const scoreCall = mockClient.request.mock.calls.find(
        c => c[0] === '/v1/scoring/score',
      );
      const body = (
        scoreCall![1] as {
          body: { scoring_functions: Record<string, unknown> };
        }
      ).body;
      expect(Object.keys(body.scoring_functions)).toEqual(['specific::fn']);
    });

    it('uses null (not {}) as scoring function config values', async () => {
      const service = await createEnabledService();

      mockClient.request.mockResolvedValueOnce({
        results: { 'basic::subset_of': { score_rows: [{ score: 1.0 }] } },
      });

      await service.scoreResponse('q', 'a');

      const scoreCall = mockClient.request.mock.calls.find(
        c => c[0] === '/v1/scoring/score',
      );
      const body = (
        scoreCall![1] as {
          body: { scoring_functions: Record<string, unknown> };
        }
      ).body;
      expect(body.scoring_functions['basic::subset_of']).toBeNull();
    });

    it('respects minScoreThreshold', async () => {
      const service = await createEnabledService({ minScoreThreshold: 0.9 });

      mockClient.request.mockResolvedValueOnce({
        results: { 'basic::subset_of': { score_rows: [{ score: 0.8 }] } },
      });

      const result = await service.scoreResponse('q', 'a');

      expect(result!.passedThreshold).toBe(false);
      expect(result!.overallScore).toBe(0.8);
    });
  });

  // ---------------------------------------------------------------------------
  // onError behavior
  // ---------------------------------------------------------------------------

  describe('onError behavior', () => {
    it('returns undefined on API failure when onError is "skip" (default)', async () => {
      const fns = [
        {
          identifier: 'fn1',
          provider_id: 'p',
          provider_resource_id: '',
          type: 's',
        },
      ];
      mockClient.request
        .mockResolvedValueOnce(fns)
        .mockRejectedValueOnce(new Error('Scoring API down'));

      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });
      await service.initialize();

      const result = await service.scoreResponse('q', 'a');
      expect(result).toBeUndefined();
    });

    it('returns error result on API failure when onError is "fail"', async () => {
      const fns = [
        {
          identifier: 'fn1',
          provider_id: 'p',
          provider_resource_id: '',
          type: 's',
        },
      ];
      mockClient.request
        .mockResolvedValueOnce(fns)
        .mockRejectedValueOnce(new Error('Scoring API down'));

      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true, onError: 'fail' }),
        getClient: () => mockClient,
      });
      await service.initialize();

      const result = await service.scoreResponse('q', 'a');
      expect(result).toBeDefined();
      expect(result!.overallScore).toBe(0);
      expect(result!.passedThreshold).toBe(false);
      expect(result!.error).toContain('Scoring API down');
    });
  });

  // ---------------------------------------------------------------------------
  // Quality levels
  // ---------------------------------------------------------------------------

  describe('quality levels', () => {
    async function scoreWith(scoreValue: number) {
      const fns = [
        {
          identifier: 'fn1',
          provider_id: 'p',
          provider_resource_id: '',
          type: 's',
        },
      ];
      mockClient.request.mockResolvedValueOnce(fns).mockResolvedValueOnce({
        results: { fn1: { score_rows: [{ score: scoreValue }] } },
      });

      const service = new EvaluationService({
        logger: mockLogger,
        config: makeConfig({ enabled: true }),
        getClient: () => mockClient,
      });
      await service.initialize();
      return service.scoreResponse('q', 'a');
    }

    it('maps 0.95 to excellent', async () => {
      const result = await scoreWith(0.95);
      expect(result!.qualityLevel).toBe('excellent');
    });

    it('maps 0.75 to good', async () => {
      const result = await scoreWith(0.75);
      expect(result!.qualityLevel).toBe('good');
    });

    it('maps 0.55 to fair', async () => {
      const result = await scoreWith(0.55);
      expect(result!.qualityLevel).toBe('fair');
    });

    it('maps 0.3 to poor', async () => {
      const result = await scoreWith(0.3);
      expect(result!.qualityLevel).toBe('poor');
    });
  });
});
