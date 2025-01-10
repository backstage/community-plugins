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
import { TechInsightCheck } from '@backstage-community/plugin-tech-insights-node';
import { TechInsightJsonRuleCheck } from '@backstage-community/plugin-tech-insights-backend-module-jsonfc/index';
import {
  BooleanCheckResult,
  CheckResponse,
} from '@backstage-community/plugin-tech-insights-common';

export enum Rank {
  Stone,
  Bronze,
  Silver,
  Gold,
}

export interface MaturityCheck extends TechInsightCheck {
  metadata: {
    category: string;
    rank: Rank;
    exp: number;
    schedule: string;
    solution: string;
  };
}

export interface MaturityJsonRuleCheck extends TechInsightJsonRuleCheck {
  metadata: {
    category: string;
    rank: Rank;
    solution: string;
  };
}

export interface MaturityCheckResponse extends CheckResponse {
  metadata: {
    category: string;
    rank: Rank;
    solution: string;
    exp: number;
  };
}

// Custom Maturity CheckResult
export interface MaturityCheckResult extends BooleanCheckResult {
  // JsonRuleBooleanCheckResult
  check: MaturityCheckResponse;
  updated?: string;
}

export interface MaturityRank {
  rank: Rank;
  isMaxRank: boolean;
}

export interface MaturityProgress {
  passedChecks: number;
  totalChecks: number;
  percentage: number;
}

export interface MaturitySummaryByArea extends MaturityRank {
  area: string;
  progress: MaturityProgress;
  rankProgress: MaturityProgress;
  maxRank: Rank;
}

export interface MaturitySummary extends MaturityRank {
  points: number;
  progress: MaturityProgress;
  rankProgress: MaturityProgress; // progress to gain the next rank
  maxRank: Rank;
  areaSummaries: MaturitySummaryByArea[];
}

export interface EntityMaturityCheckResult extends MaturityRank {
  entity: string;
  checks: MaturityCheckResult[];
}

export interface EntityMaturitySummary {
  entity: string;
  summary: MaturitySummary;
}

export type BulkMaturityCheckResponse = EntityMaturityCheckResult[];

export type BulkMaturitySummary = EntityMaturitySummary[];
