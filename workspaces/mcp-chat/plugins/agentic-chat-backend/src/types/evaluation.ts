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
  ChatResponse,
  EvaluationResult,
} from '@backstage-community/plugin-agentic-chat-common';

/**
 * Configuration for response evaluation
 * @public
 */
export interface EvaluationConfig {
  /** Enable automatic response scoring */
  enabled: boolean;
  /** Scoring function IDs to use */
  scoringFunctions?: string[];
  /** Minimum score threshold (0-1) - below this, add warning to response */
  minScoreThreshold?: number;
  /**
   * Behavior when evaluation fails due to an error.
   * - 'skip': Skip evaluation on error and return the response as-is
   * - 'fail': Return a failed evaluation result to flag the issue
   * Default: 'skip' (evaluation is optional, don't block responses)
   */
  onError?: 'skip' | 'fail';
}

/**
 * Scoring function information from Llama Stack
 * @public
 */
export interface ScoringFunctionInfo {
  identifier: string;
  provider_id: string;
  provider_resource_id: string;
  type: string;
  description?: string;
  params?: Record<string, unknown>;
}

/**
 * Individual score result
 * @public
 */
export interface ScoreResult {
  score_type: string;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Response from scoring API
 * @internal
 */
export interface ScoringResponse {
  results: Record<
    string,
    {
      score_rows: Array<{
        /** Per-function nested scores (e.g. accuracy sub-metrics) */
        scores?: Record<string, ScoreResult>;
        /** Direct score value (used by basic::subset_of and similar) */
        score?: number;
      }>;
      /** Aggregated results (e.g. accuracy summary) */
      aggregated_results?: Record<string, Record<string, number>>;
    }
  >;
}

/**
 * Extended chat response with evaluation information
 * @public
 */
export interface EvaluatedChatResponse extends ChatResponse {
  /** Evaluation result if scoring is enabled */
  evaluation?: EvaluationResult;
}
