/*
 * Copyright 2022 The Backstage Authors
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
  PuppetDbApi,
  PuppetDbReport,
  PuppetDbReportEvent,
  PuppetDbReportLog,
} from './types';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

export class PuppetDbClient implements PuppetDbApi {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;

  constructor({
    discoveryApi,
    fetchApi,
  }: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = discoveryApi;
    this.fetchApi = fetchApi;
  }

  private async callApi<T>(
    path: string,
    query: { [key in string]: any },
  ): Promise<T | undefined> {
    const apiUrl = `${await this.discoveryApi.getBaseUrl('proxy')}/puppetdb`;
    const response = await this.fetchApi.fetch(
      `${apiUrl}${path}?${new URLSearchParams(query).toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.ok) {
      return (await response.json()) as T;
    }
    throw await ResponseError.fromResponse(response);
  }

  async getPuppetDbReportEvents(
    puppetDbReportHash: string,
  ): Promise<PuppetDbReportEvent[] | undefined> {
    if (!puppetDbReportHash) {
      throw new Error('PuppetDB report hash is required');
    }

    const events = (await this.callApi(
      `/pdb/query/v4/reports/${puppetDbReportHash}/events`,
      {},
    )) as PuppetDbReportEvent[];

    if (!events || events.length === 0) {
      return undefined;
    }

    return events;
  }

  async getPuppetDbReportLogs(
    puppetDbReportHash: string,
  ): Promise<PuppetDbReportLog[] | undefined> {
    if (!puppetDbReportHash) {
      throw new Error('PuppetDB report hash is required');
    }

    const events = (await this.callApi(
      `/pdb/query/v4/reports/${puppetDbReportHash}/logs`,
      {},
    )) as PuppetDbReportLog[];

    if (!events || events.length === 0) {
      return undefined;
    }

    return events;
  }

  async getPuppetDbNodeReports(
    puppetDbCertName: string,
  ): Promise<PuppetDbReport[] | undefined> {
    if (!puppetDbCertName) {
      throw new Error('PuppetDB certname is required');
    }

    return this.callApi(`/pdb/query/v4/reports`, {
      query: `["=","certname","${puppetDbCertName}"]`,
      order_by: `[{"field": "start_time", "order": "desc"},{"field": "end_time", "order": "desc"}]`,
      limit: 100,
    });
  }
}
