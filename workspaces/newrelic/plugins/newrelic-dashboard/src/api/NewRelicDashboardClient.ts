/*
 * Copyright 2021 The Backstage Authors
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
import {
  DashboardEntitySummary,
  DashboardSnapshotSummary,
  NewRelicDashboardApi,
} from './NewRelicDashboardApi';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { DashboardEntity } from '../types/DashboardEntity';
import { ResponseError } from '@backstage/errors';

export class NewRelicDashboardClient implements NewRelicDashboardApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor({
    discoveryApi,
    fetchApi,
  }: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    baseUrl?: string;
  }) {
    this.discoveryApi = discoveryApi;
    this.fetchApi = fetchApi;
  }

  async getDashboardEntity(
    guid: string,
  ): Promise<DashboardEntitySummary | undefined> {
    const baseUrl = await this.discoveryApi.getBaseUrl('newrelic-dashboard');
    const url = `${baseUrl}/entities?guid=${encodeURIComponent(guid)}`;
    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    const body = (await response.json()) as DashboardEntity;
    return { getDashboardEntity: body };
  }

  async getDashboardSnapshot(
    guid: string,
    duration: number,
  ): Promise<DashboardSnapshotSummary | undefined> {
    const baseUrl = await this.discoveryApi.getBaseUrl('newrelic-dashboard');
    const url = `${baseUrl}/snapshot/image?guid=${encodeURIComponent(
      guid,
    )}&duration=${duration}`;
    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    const pdfUrl = URL.createObjectURL(await response.blob());
    return {
      getDashboardSnapshot: {
        data: { dashboardCreateSnapshotUrl: pdfUrl },
      },
    };
  }
}
