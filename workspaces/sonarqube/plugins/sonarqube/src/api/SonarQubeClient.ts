/*
 * Copyright 2020 The Backstage Authors
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
  CompoundEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  FindingSummary,
  Metrics,
  SonarQubeApi,
} from '@backstage-community/plugin-sonarqube-react';
import { SummaryWrapper } from './types';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

/** @public */
export class SonarQubeClient implements SonarQubeApi {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async callApi<T>(
    path: string,
    query: { [key in string]: string },
  ): Promise<T | undefined> {
    const response = await this.fetchApi.fetch(
      `${await this.discoveryApi.getBaseUrl(
        'sonarqube',
      )}/${path}?${new URLSearchParams(query).toString()}`,
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

  async getFindingSummary(
    entityRef: CompoundEntityRef,
  ): Promise<FindingSummary | undefined> {
    const { kind, namespace, name } = entityRef;
    const summary = await this.callApi<SummaryWrapper>(
      `entities/${encodeURIComponent(kind)}/${encodeURIComponent(
        namespace,
      )}/${encodeURIComponent(name)}/summary`,
      {},
    );

    if (!summary || !summary.findings) {
      return undefined;
    }

    const { componentKey, instanceUrl: rawUrl, findings } = summary;
    let baseUrl = rawUrl;
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }

    const metrics: Metrics = {
      alert_status: undefined,
      bugs: undefined,
      reliability_rating: undefined,
      vulnerabilities: undefined,
      security_rating: undefined,
      security_hotspots_reviewed: undefined,
      security_review_rating: undefined,
      code_smells: undefined,
      sqale_rating: undefined,
      coverage: undefined,
      duplicated_lines_density: undefined,
    };

    findings.measures.forEach(m => {
      metrics[m.metric] = m.value;
    });

    return {
      title: componentKey,
      lastAnalysis: findings.analysisDate,
      metrics,
      projectUrl: `${baseUrl}dashboard?id=${encodeURIComponent(componentKey)}`,
      getIssuesUrl: identifier =>
        `${baseUrl}project/issues?id=${encodeURIComponent(
          componentKey,
        )}&types=${identifier.toLocaleUpperCase('en-US')}&resolved=false`,
      getComponentMeasuresUrl: identifier =>
        `${baseUrl}component_measures?id=${encodeURIComponent(
          componentKey,
        )}&metric=${identifier.toLocaleLowerCase(
          'en-US',
        )}&resolved=false&view=list`,
      getSecurityHotspotsUrl: () =>
        `${baseUrl}${
          baseUrl === 'https://sonarcloud.io/' ? 'project/' : ''
        }security_hotspots?id=${encodeURIComponent(componentKey)}`,
    };
  }

  async getFindingSummaries(
    entityRefs: CompoundEntityRef[],
  ): Promise<Map<string, FindingSummary | undefined>> {
    const map = new Map<string, FindingSummary | undefined>();
    if (entityRefs.length === 0) {
      return map;
    }
    const results = await Promise.allSettled(
      entityRefs.map(ref => this.getFindingSummary(ref)),
    );
    entityRefs.forEach((ref, i) => {
      const result = results[i];
      map.set(
        stringifyEntityRef(ref),
        result.status === 'fulfilled' ? result.value : undefined,
      );
    });
    return map;
  }
}
