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
import type {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import type { LlamaStackClient } from './LlamaStackClient';
import type {
  EvaluationConfig,
  ScoringFunctionInfo,
  ScoringResponse,
  EvaluationResult,
} from '../../types';
import { toErrorMessage } from '../../services/utils';

/**
 * Accessor function that returns the current LlamaStackClient.
 * Allows EvaluationService to always use the latest client managed by ClientManager.
 */
export type EvalClientAccessor = () => LlamaStackClient;

/**
 * Evaluation Service - Scores AI responses using Llama Stack Scoring API
 *
 * Uses the Llama Stack Scoring API (POST /v1/scoring/score) with the correct
 * field names: input_query, generated_answer, expected_answer.
 *
 * Uses LlamaStackClient (via accessor) for all HTTP communication.
 */
export class EvaluationService {
  private readonly logger: LoggerService;
  private readonly config: RootConfigService;
  private readonly getClient?: EvalClientAccessor;
  private evaluationConfig: EvaluationConfig | null = null;
  private availableScoringFunctions: ScoringFunctionInfo[] = [];
  private initialized = false;

  constructor(options: {
    logger: LoggerService;
    config: RootConfigService;
    getClient?: EvalClientAccessor;
  }) {
    this.logger = options.logger;
    this.config = options.config;
    this.getClient = options.getClient;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const llamaStackConfig = this.config.getOptionalConfig(
        'agenticChat.llamaStack',
      );
      if (!llamaStackConfig) {
        this.logger.info(
          'agenticChat.llamaStack not configured, evaluation service disabled',
        );
        this.initialized = true;
        return;
      }

      this.evaluationConfig = this.loadEvaluationConfig();

      if (!this.evaluationConfig?.enabled) {
        this.logger.info('Response evaluation is disabled');
        this.initialized = true;
        return;
      }

      if (!this.getClient) {
        this.logger.warn(
          'Evaluation enabled but no LlamaStackClient accessor provided, scoring API calls will fail',
        );
        this.initialized = true;
        return;
      }

      await this.loadAvailableScoringFunctions();

      this.logger.info(
        `Evaluation service initialized with ${this.availableScoringFunctions.length} scoring function(s) available`,
      );
      this.initialized = true;
    } catch (error) {
      this.logger.warn(
        `Failed to initialize evaluation service: ${toErrorMessage(error)}`,
      );
      this.initialized = true;
    }
  }

  private loadEvaluationConfig(): EvaluationConfig | null {
    try {
      const evalConfig = this.config.getOptionalConfig(
        'agenticChat.evaluation',
      );
      if (!evalConfig) {
        return { enabled: false };
      }

      const onErrorValue = evalConfig.getOptionalString('onError');
      const onError: 'skip' | 'fail' =
        onErrorValue === 'fail' ? 'fail' : 'skip';

      return {
        enabled: evalConfig.getOptionalBoolean('enabled') ?? false,
        scoringFunctions: evalConfig.getOptionalStringArray('scoringFunctions'),
        minScoreThreshold:
          evalConfig.getOptionalNumber('minScoreThreshold') ?? 0.7,
        onError,
      };
    } catch (error) {
      this.logger.debug('No evaluation configuration found');
      return { enabled: false };
    }
  }

  private async loadAvailableScoringFunctions(): Promise<void> {
    try {
      const client = this.getClient!();
      const response = await client.request<
        { data?: ScoringFunctionInfo[] } | ScoringFunctionInfo[]
      >('/v1/scoring-functions', { method: 'GET' });

      const functions = Array.isArray(response)
        ? response
        : response.data || [];
      this.availableScoringFunctions = functions;

      if (this.availableScoringFunctions.length > 0) {
        this.logger.info(
          `Scoring functions available: ${this.availableScoringFunctions
            .map(s => s.identifier)
            .join(', ')}`,
        );
      } else {
        this.logger.debug(
          'No scoring functions available on this Llama Stack server',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Could not load scoring functions: ${toErrorMessage(error)}`,
      );
      this.availableScoringFunctions = [];
    }
  }

  /**
   * Dynamic overrides from admin panel (EffectiveConfig).
   */
  private dynamicOverrides?: {
    enabled?: boolean;
    scoringFunctions?: string[];
    minScoreThreshold?: number;
    onError?: 'skip' | 'fail';
  };

  /**
   * Apply dynamic overrides from EffectiveConfig.
   * Called per-request by the orchestrator/provider.
   */
  applyDynamicOverrides(overrides: {
    evaluationEnabled?: boolean;
    scoringFunctions?: string[];
    minScoreThreshold?: number;
    evaluationOnError?: 'skip' | 'fail';
  }): void {
    if (
      overrides.evaluationEnabled !== undefined ||
      overrides.scoringFunctions !== undefined ||
      overrides.minScoreThreshold !== undefined ||
      overrides.evaluationOnError !== undefined
    ) {
      this.dynamicOverrides = {
        enabled: overrides.evaluationEnabled,
        scoringFunctions: overrides.scoringFunctions,
        minScoreThreshold: overrides.minScoreThreshold,
        onError: overrides.evaluationOnError,
      };
    }
  }

  private isEffectivelyEnabled(): boolean {
    if (this.dynamicOverrides?.enabled !== undefined) {
      return this.dynamicOverrides.enabled;
    }
    return this.evaluationConfig?.enabled ?? false;
  }

  private getEffectiveScoringFunctions(): string[] | undefined {
    return (
      this.dynamicOverrides?.scoringFunctions ??
      this.evaluationConfig?.scoringFunctions
    );
  }

  private getEffectiveThreshold(): number {
    return (
      this.dynamicOverrides?.minScoreThreshold ??
      this.evaluationConfig?.minScoreThreshold ??
      0.7
    );
  }

  isEnabled(): boolean {
    return this.isEffectivelyEnabled();
  }

  getAvailableScoringFunctions(): ScoringFunctionInfo[] {
    return this.availableScoringFunctions;
  }

  getMinScoreThreshold(): number {
    return this.getEffectiveThreshold();
  }

  /**
   * Score a response using the Llama Stack Scoring API.
   *
   * Uses the correct Llama Stack field names:
   * - input_query: the user's question
   * - generated_answer: the AI's response
   * - expected_answer: (optional) ground-truth for accuracy scoring
   */
  async scoreResponse(
    userInput: string,
    aiResponse: string,
    context?: string[],
    expectedAnswer?: string,
  ): Promise<EvaluationResult | undefined> {
    if (!this.isEffectivelyEnabled()) {
      return undefined;
    }

    if (this.availableScoringFunctions.length === 0) {
      this.logger.debug('No scoring functions available, skipping evaluation');
      return undefined;
    }

    if (!this.getClient) {
      this.logger.warn('Cannot score response: no LlamaStackClient accessor');
      return undefined;
    }

    try {
      const effectiveFns = this.getEffectiveScoringFunctions();
      const functionsToUse = effectiveFns?.length
        ? effectiveFns
        : this.availableScoringFunctions.map(f => f.identifier);

      const inputRow: Record<string, string> = {
        input_query: userInput,
        generated_answer: aiResponse,
      };

      if (expectedAnswer) {
        inputRow.expected_answer = expectedAnswer;
      }

      if (context && context.length > 0) {
        inputRow.context = context.join('\n');
      }

      const scoringRequest = {
        input_rows: [inputRow],
        scoring_functions: Object.fromEntries(
          functionsToUse.map(fn => [fn, null]),
        ),
      };

      this.logger.debug(
        `Scoring response with functions: ${functionsToUse.join(', ')}`,
      );

      const client = this.getClient();
      const response = await client.request<ScoringResponse>(
        '/v1/scoring/score',
        {
          method: 'POST',
          body: scoringRequest,
        },
      );

      const scores: Record<string, number> = {};
      let totalScore = 0;
      let scoreCount = 0;

      for (const [functionId, result] of Object.entries(
        response.results || {},
      )) {
        if (result.score_rows && result.score_rows.length > 0) {
          const row = result.score_rows[0];
          if (row.scores && Object.keys(row.scores).length > 0) {
            for (const [scoreName, scoreData] of Object.entries(row.scores)) {
              const value = scoreData.value;
              if (typeof value === 'number') {
                scores[`${functionId}:${scoreName}`] = value;
                totalScore += value;
                scoreCount++;
              }
            }
          } else if (typeof row.score === 'number') {
            scores[functionId] = row.score;
            totalScore += row.score;
            scoreCount++;
          }
        }
      }

      const overallScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      const threshold = this.getEffectiveThreshold();

      const evaluationResult: EvaluationResult = {
        overallScore,
        scores,
        passedThreshold: overallScore >= threshold,
        qualityLevel: this.getQualityLevel(overallScore),
        evaluatedAt: new Date().toISOString(),
      };

      this.logger.info(
        `Response scored: ${overallScore.toFixed(2)} (${
          evaluationResult.qualityLevel
        })`,
      );

      return evaluationResult;
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.warn(`Failed to score response: ${errorMsg}`);

      const onError =
        this.dynamicOverrides?.onError ??
        this.evaluationConfig?.onError ??
        'skip';

      if (onError === 'fail') {
        this.logger.warn(
          'Evaluation failed - returning error result (onError: fail)',
        );
        return {
          overallScore: 0,
          scores: {},
          passedThreshold: false,
          qualityLevel: 'poor',
          evaluatedAt: new Date().toISOString(),
          error: `Evaluation failed: ${errorMsg}`,
        };
      }

      this.logger.debug(
        'Evaluation failed - skipping evaluation (onError: skip)',
      );
      return undefined;
    }
  }

  private getQualityLevel(
    score: number,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'fair';
    return 'poor';
  }
}
