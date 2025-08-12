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

import {
  BulkCheckResponse,
  CheckResult,
  FactSchema,
  Check,
  InsightFacts,
} from '@backstage-community/plugin-tech-insights-common';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  CompoundEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import qs from 'qs';
import { AuthService } from '@backstage/backend-plugin-api';
import stableStringify from 'fast-json-stable-stringify';

/**
 * Client to fetch data from tech-insights backend
 *
 * @public */
export class TechInsightsClient {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi | AuthService;
  private readonly apiCache = new Map<string, Promise<any>>();
  private readonly chunkSize = 750;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi | AuthService;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  /**
   * Get facts for a specific entity
   * @param entity - a component reference
   * @param facts - a list fact ids to fetch
   * @public
   */
  async getFacts(
    entity: CompoundEntityRef,
    facts: string[],
  ): Promise<InsightFacts> {
    const query = qs.stringify({
      entity: stringifyEntityRef(entity),
      ids: facts,
    });
    return await this.api<InsightFacts>(`/facts/latest?${query}`);
  }

  /**
   * Get all checks.
   * This will not return the actual status, but only metadata. To get the status use the /run endpoint
   * @public
   */
  async getAllChecks(): Promise<Check[]> {
    return this.api('/checks');
  }

  /**
   * Get schemas of facts.
   * Use this for example to understand what the return values will be
   * @public
   */
  async getFactSchemas(): Promise<FactSchema[]> {
    return this.api('/fact-schemas');
  }

  /**
   * Run checks for a specific entity
   * @param entityParams - reference to an entity
   * @param checks - IDs of checks to run
   * @public
   */
  async runChecks(
    entityParams: CompoundEntityRef,
    checks?: string[],
  ): Promise<CheckResult[]> {
    const { namespace, kind, name } = entityParams;
    const requestBody = { checks };
    return this.api(
      `/checks/run/${encodeURIComponent(namespace)}/${encodeURIComponent(
        kind,
      )}/${encodeURIComponent(name)}`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      },
    );
  }

  /**
   * Return checks for multiple entities
   * @param entities - list of entity references
   * @param checks - list of check IDs
   * @public
   */
  async runBulkChecks(
    entities: CompoundEntityRef[],
    checks?: Check[],
  ): Promise<BulkCheckResponse> {
    const checkIds = checks ? checks.map(check => check.id) : [];
    let bulkResponse: BulkCheckResponse = [];
    for (let i = 0; i <= entities.length; i += this.chunkSize) {
      const chunk = entities.slice(i, i + this.chunkSize);
      const requestBody = {
        entities: chunk,
        checks: checkIds.length > 0 ? checkIds : undefined,
      };
      const response = await this.api('/checks/run', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      bulkResponse = bulkResponse.concat(response as BulkCheckResponse);
    }
    return bulkResponse;
  }

  private getCacheKey(path: string, init?: RequestInit): string {
    return `${path} ${stableStringify(init ?? {})}`;
  }

  private async api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = await this.discoveryApi.getBaseUrl('tech-insights');

    const cacheKey = this.getCacheKey(`${url}${path}`, init);
    const cached = this.apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = (async () => {
      const token = await this.getToken();

      const headers: HeadersInit = new Headers(init?.headers);
      if (!headers.has('content-type'))
        headers.set('content-type', 'application/json');
      if (token && !headers.has('authorization')) {
        headers.set('authorization', `Bearer ${token}`);
      }

      const request = new Request(`${url}${path}`, {
        ...init,
        headers,
      });

      return fetch(request).then(async response => {
        if (!response.ok) {
          throw await ResponseError.fromResponse(response);
        }
        return response.json() as Promise<T>;
      });
    })();

    // Fill cache, and clear after 2 seconds
    this.apiCache.set(cacheKey, result);
    setTimeout(() => {
      this.apiCache.delete(cacheKey);
    }, 2000);

    return result;
  }

  private async getToken(): Promise<string | null> {
    let result: { token?: string | undefined };

    if ('getCredentials' in this.identityApi) {
      result = await this.identityApi.getCredentials();
    } else {
      result = await this.identityApi.getPluginRequestToken({
        onBehalfOf: await this.identityApi.getOwnServiceCredentials(),
        targetPluginId: 'tech-insights',
      });
    }

    return result.token ?? null;
  }
}
