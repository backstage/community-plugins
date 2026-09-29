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
import { DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';
import { V2MyDashboardResponse } from '@backstage-community/plugin-copilot-common';
import { MyDashboardParams, MyMetricsApi } from './MyMetricsApi';

/**
 * Default {@link MyMetricsApi} implementation. Talks to the `copilot`
 * backend plugin's `/v2/me/*` routes only — it has no method that accepts a
 * user or team identifier, so it is structurally impossible to use this
 * client to request another user's or a team's metrics.
 *
 * @public
 */
export class MyMetricsClient implements MyMetricsApi {
  public constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  public async getMyDashboard(
    params: MyDashboardParams,
  ): Promise<V2MyDashboardResponse> {
    const query = new URLSearchParams();
    query.append('type', params.type);
    query.append('entityId', params.entityId);
    query.append('from', params.from);
    query.append('to', params.to);

    return this.get<V2MyDashboardResponse>(`v2/me/dashboard?${query}`);
  }

  private async get<T>(path: string): Promise<T> {
    // Intentionally targets the existing `copilot` backend plugin's
    // discovery URL — this client has no other backend to talk to.
    const baseUrl = await this.options.discoveryApi.getBaseUrl('copilot');
    const response = await this.options.fetchApi.fetch(`${baseUrl}/${path}`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<T>;
  }
}
