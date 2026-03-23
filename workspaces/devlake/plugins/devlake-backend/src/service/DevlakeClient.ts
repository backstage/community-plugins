/*
 * Copyright 2024 The Backstage Authors
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

import { LoggerService } from '@backstage/backend-plugin-api';
import {
  DoraMetrics,
  DoraMetricsTrend,
  DoraMetricTrendPoint,
  classifyDeploymentFrequency,
  classifyLeadTime,
  classifyChangeFailureRate,
  classifyMeanTimeToRecovery,
} from '@backstage-community/plugin-devlake-common';
import { DevlakeConfig } from '../types';

/** @internal */
export class DevlakeClient {
  private readonly baseUrl: string;
  private readonly logger: LoggerService;

  constructor(config: DevlakeConfig, logger: LoggerService) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.logger = logger;
  }

  async getDoraMetrics(options: {
    projectName: string;
    from: string;
    to: string;
  }): Promise<DoraMetrics> {
    const { projectName, from, to } = options;

    const [df, lt, cfr, mttr] = await Promise.all([
      this.fetchDeploymentFrequency(projectName, from, to),
      this.fetchLeadTimeForChanges(projectName, from, to),
      this.fetchChangeFailureRate(projectName, from, to),
      this.fetchMeanTimeToRecovery(projectName, from, to),
    ]);

    return {
      deploymentFrequency: {
        value: df.value,
        unit: df.unit,
        level: classifyDeploymentFrequency(df.value),
        trend: df.trend,
      },
      leadTimeForChanges: {
        value: lt.value,
        unit: lt.unit,
        level: classifyLeadTime(lt.value),
        trend: lt.trend,
      },
      changeFailureRate: {
        value: cfr.value,
        unit: cfr.unit,
        level: classifyChangeFailureRate(cfr.value),
        trend: cfr.trend,
      },
      meanTimeToRecovery: {
        value: mttr.value,
        unit: mttr.unit,
        level: classifyMeanTimeToRecovery(mttr.value),
        trend: mttr.trend,
      },
    };
  }

  async getDoraTrend(options: {
    projectName: string;
    from: string;
    to: string;
  }): Promise<DoraMetricsTrend> {
    const { projectName, from, to } = options;

    const [df, lt, cfr, mttr] = await Promise.all([
      this.fetchMetricTrend('deployment_frequency', projectName, from, to),
      this.fetchMetricTrend('lead_time_for_changes', projectName, from, to),
      this.fetchMetricTrend('change_failure_rate', projectName, from, to),
      this.fetchMetricTrend('mean_time_to_recovery', projectName, from, to),
    ]);

    return {
      deploymentFrequency: df,
      leadTimeForChanges: lt,
      changeFailureRate: cfr,
      meanTimeToRecovery: mttr,
    };
  }

  private async fetchDeploymentFrequency(
    projectName: string,
    from: string,
    to: string,
  ): Promise<{ value: number; unit: string; trend: number }> {
    const data = await this.callDevlakeApi(
      `/api/plugins/dora/deployment_frequency?project=${encodeURIComponent(
        projectName,
      )}&from=${from}&to=${to}`,
    );
    return {
      value: data.avgDeploymentFrequency ?? 0,
      unit: 'deploys/day',
      trend: data.trend ?? 0,
    };
  }

  private async fetchLeadTimeForChanges(
    projectName: string,
    from: string,
    to: string,
  ): Promise<{ value: number; unit: string; trend: number }> {
    const data = await this.callDevlakeApi(
      `/api/plugins/dora/lead_time_for_changes?project=${encodeURIComponent(
        projectName,
      )}&from=${from}&to=${to}`,
    );
    const hours = (data.avgLeadTimeForChanges ?? 0) / 60;
    return {
      value: Math.round(hours * 10) / 10,
      unit: 'hours',
      trend: data.trend ?? 0,
    };
  }

  private async fetchChangeFailureRate(
    projectName: string,
    from: string,
    to: string,
  ): Promise<{ value: number; unit: string; trend: number }> {
    const data = await this.callDevlakeApi(
      `/api/plugins/dora/change_failure_rate?project=${encodeURIComponent(
        projectName,
      )}&from=${from}&to=${to}`,
    );
    return {
      value: Math.round((data.avgChangeFailureRate ?? 0) * 100 * 10) / 10,
      unit: '%',
      trend: data.trend ?? 0,
    };
  }

  private async fetchMeanTimeToRecovery(
    projectName: string,
    from: string,
    to: string,
  ): Promise<{ value: number; unit: string; trend: number }> {
    const data = await this.callDevlakeApi(
      `/api/plugins/dora/mean_time_to_recovery?project=${encodeURIComponent(
        projectName,
      )}&from=${from}&to=${to}`,
    );
    const hours = (data.avgMeanTimeToRecovery ?? 0) / 60;
    return {
      value: Math.round(hours * 10) / 10,
      unit: 'hours',
      trend: data.trend ?? 0,
    };
  }

  private async fetchMetricTrend(
    metric: string,
    projectName: string,
    from: string,
    to: string,
  ): Promise<DoraMetricTrendPoint[]> {
    const data = await this.callDevlakeApi(
      `/api/plugins/dora/${metric}?project=${encodeURIComponent(
        projectName,
      )}&from=${from}&to=${to}&period=daily`,
    );
    if (!Array.isArray(data.data)) {
      return [];
    }
    return data.data.map((point: { date: string; value: number }) => ({
      date: point.date,
      value: point.value,
    }));
  }

  private async callDevlakeApi(path: string): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`Calling DevLake API: ${url}`);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        `DevLake API returned ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }
}
