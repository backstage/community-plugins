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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  PeriodRange,
  V2BackfillStatus,
  V2DailyTotal,
  V2DashboardData,
  V2MetricsByFeatureRow,
  V2MetricsByIdeRow,
  V2MetricsByLanguageFeatureRow,
  V2MetricsByModelFeatureRow,
  V2MetricsByLanguageModelRow,
  V2PrMetricsRow,
} from '@backstage-community/plugin-copilot-common';
import { CopilotApiV2, V2MetricsParams } from './CopilotApiV2';

export class CopilotClientV2 implements CopilotApiV2 {
  public constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  public async getDailyMetrics(
    params: V2MetricsParams,
  ): Promise<V2DailyTotal[]> {
    return this.get<V2DailyTotal[]>(
      `v2/metrics/daily?${this.buildMetricsQuery(params)}`,
    );
  }

  public async getPrMetrics(
    params: V2MetricsParams,
  ): Promise<V2PrMetricsRow[]> {
    return this.get<V2PrMetricsRow[]>(
      `v2/metrics/pull-requests?${this.buildMetricsQuery(params)}`,
    );
  }

  public async getByFeature(
    params: V2MetricsParams,
  ): Promise<V2MetricsByFeatureRow[]> {
    return this.get<V2MetricsByFeatureRow[]>(
      `v2/metrics/by-feature?${this.buildMetricsQuery(params)}`,
    );
  }

  public async getByIde(params: V2MetricsParams): Promise<V2MetricsByIdeRow[]> {
    return this.get<V2MetricsByIdeRow[]>(
      `v2/metrics/by-ide?${this.buildMetricsQuery(params)}`,
    );
  }

  public async getLanguageByFeature(
    params: V2MetricsParams & { feature?: string },
  ): Promise<V2MetricsByLanguageFeatureRow[]> {
    const queryString = this.buildMetricsQuery(params);
    if (params.feature) {
      queryString.append('feature', params.feature);
    }
    return this.get<V2MetricsByLanguageFeatureRow[]>(
      `v2/metrics/by-language?${queryString}`,
    );
  }

  public async getTeams(
    params: Pick<V2MetricsParams, 'type' | 'entityId'> & {
      from?: string;
      to?: string;
    },
  ): Promise<string[]> {
    const queryString = new URLSearchParams();
    queryString.append('type', params.type);
    queryString.append('entityId', params.entityId);

    if (params.from) {
      queryString.append('from', params.from);
    }
    if (params.to) {
      queryString.append('to', params.to);
    }

    return this.get<string[]>(`v2/teams?${queryString}`);
  }

  public async getPeriodRange(
    params: Pick<V2MetricsParams, 'type' | 'entityId'>,
  ): Promise<PeriodRange | null> {
    const queryString = new URLSearchParams();
    queryString.append('type', params.type);
    queryString.append('entityId', params.entityId);

    try {
      return await this.get<PeriodRange>(
        `v2/metrics/period-range?${queryString}`,
      );
    } catch (err) {
      if (err instanceof ResponseError && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  }

  public async getBackfillStatus(
    params: Pick<V2MetricsParams, 'type' | 'entityId'> & {
      from?: string;
      to?: string;
    },
  ): Promise<V2BackfillStatus[]> {
    const queryString = new URLSearchParams();
    queryString.append('type', params.type);
    queryString.append('entityId', params.entityId);

    if (params.from) {
      queryString.append('from', params.from);
    }
    if (params.to) {
      queryString.append('to', params.to);
    }

    return this.get<V2BackfillStatus[]>(`v2/backfill/status?${queryString}`);
  }

  public async getByModelFeature(
    params: V2MetricsParams,
  ): Promise<V2MetricsByModelFeatureRow[]> {
    return this.get<V2MetricsByModelFeatureRow[]>(
      `v2/metrics/by-model-feature?${this.buildMetricsQuery(params)}`,
    );
  }

  public async getByLanguageModel(
    params: V2MetricsParams,
  ): Promise<V2MetricsByLanguageModelRow[]> {
    return this.get<V2MetricsByLanguageModelRow[]>(
      `v2/metrics/by-language-model?${this.buildMetricsQuery(params)}`,
    );
  }

  public async getDashboardData(
    params: V2MetricsParams,
  ): Promise<V2DashboardData> {
    return this.get<V2DashboardData>(
      `v2/dashboard?${this.buildMetricsQuery(params)}`,
    );
  }

  private buildMetricsQuery(params: V2MetricsParams): URLSearchParams {
    const queryString = new URLSearchParams();
    queryString.append('type', params.type);
    queryString.append('entityId', params.entityId);
    queryString.append('from', params.from);
    queryString.append('to', params.to);

    if (params.team) {
      queryString.append('team', params.team);
    }

    return queryString;
  }

  private async get<T>(path: string): Promise<T> {
    const baseUrl = await this.options.discoveryApi.getBaseUrl('copilot');
    const response = await this.options.fetchApi.fetch(`${baseUrl}/${path}`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<T>;
  }
}
