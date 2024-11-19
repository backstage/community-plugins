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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { CopilotApi } from './CopilotApi';
import {
  Metric,
  MetricsType,
  PeriodRange,
} from '@backstage-community/plugin-copilot-common';
import { DateTime } from 'luxon';

export class CopilotClient implements CopilotApi {
  public constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  public async getMetrics(
    startDate: Date,
    endDate: Date,
    type: MetricsType,
    team?: string,
  ): Promise<Metric[]> {
    const queryString = new URLSearchParams();

    queryString.append(
      'startDate',
      DateTime.fromJSDate(startDate).toFormat('yyyy-MM-dd'),
    );
    queryString.append(
      'endDate',
      DateTime.fromJSDate(endDate).toFormat('yyyy-MM-dd'),
    );

    queryString.append('type', type);

    if (team) {
      queryString.append('team', team);
    }

    const urlSegment = `metrics?${queryString}`;

    return await this.get<Metric[]>(urlSegment);
  }

  public async periodRange(type: MetricsType): Promise<PeriodRange> {
    const queryString = new URLSearchParams();
    queryString.append('type', type);

    const urlSegment = `metrics/period-range?${queryString}`;

    return await this.get<PeriodRange>(urlSegment);
  }

  public async fetchTeams(
    startDate: Date,
    endDate: Date,
    type: MetricsType,
  ): Promise<string[]> {
    const queryString = new URLSearchParams();

    queryString.append(
      'startDate',
      DateTime.fromJSDate(startDate).toFormat('yyyy-MM-dd'),
    );
    queryString.append(
      'endDate',
      DateTime.fromJSDate(endDate).toFormat('yyyy-MM-dd'),
    );

    queryString.append('type', type);

    const urlSegment = `teams?${queryString}`;

    return await this.get<string[]>(urlSegment);
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
