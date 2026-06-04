/*
 * Copyright 2026 The Backstage Authors
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

import { ApiRef, createApiRef } from '@backstage/core-plugin-api';
import {
  V2DailyTotal,
  V2PrMetricsRow,
  V2MetricsByFeatureRow,
  V2MetricsByIdeRow,
  V2MetricsByLanguageFeatureRow,
  V2MetricsByModelFeatureRow,
  V2MetricsByLanguageModelRow,
  V2BackfillStatus,
  V2DashboardData,
  PeriodRange,
  MetricsScope,
} from '@backstage-community/plugin-copilot-common';

export const copilotApiV2Ref: ApiRef<CopilotApiV2> = createApiRef<CopilotApiV2>(
  {
    id: 'plugin.copilot.service.v2',
  },
);

export interface V2MetricsParams {
  type: MetricsScope;
  entityId: string;
  from: string;
  to: string;
  team?: string;
}

export interface CopilotApiV2 {
  getDailyMetrics(params: V2MetricsParams): Promise<V2DailyTotal[]>;
  getPrMetrics(params: V2MetricsParams): Promise<V2PrMetricsRow[]>;
  getByFeature(params: V2MetricsParams): Promise<V2MetricsByFeatureRow[]>;
  getByIde(params: V2MetricsParams): Promise<V2MetricsByIdeRow[]>;
  getByLanguage(
    params: V2MetricsParams & { feature?: string },
  ): Promise<V2MetricsByLanguageFeatureRow[]>;
  getTeams(
    params: Pick<V2MetricsParams, 'type' | 'entityId'> & {
      from?: string;
      to?: string;
    },
  ): Promise<string[]>;
  getPeriodRange(
    params: Pick<V2MetricsParams, 'type' | 'entityId'>,
  ): Promise<PeriodRange | null>;
  getBackfillStatus(
    params: Pick<V2MetricsParams, 'type' | 'entityId'> & {
      from?: string;
      to?: string;
    },
  ): Promise<V2BackfillStatus[]>;
  getByModelFeature(
    params: V2MetricsParams,
  ): Promise<V2MetricsByModelFeatureRow[]>;
  getByLanguageModel(
    params: V2MetricsParams,
  ): Promise<V2MetricsByLanguageModelRow[]>;
  getDashboardData(params: V2MetricsParams): Promise<V2DashboardData>;
}
