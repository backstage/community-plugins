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
import { Entity } from '@backstage/catalog-model';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  CheckmarxApi,
  CheckmarxEntitySummary,
} from '@backstage-community/plugin-checkmarx-react';

/** @public */
export class CheckmarxClient implements CheckmarxApi {
  constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  private async callApi<T>(path: string): Promise<T | undefined> {
    const response = await this.options.fetchApi.fetch(
      `${await this.options.discoveryApi.getBaseUrl('checkmarx')}/${path}`,
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

  async getEntitySummary(
    entity: Entity,
  ): Promise<CheckmarxEntitySummary | undefined> {
    const kind = encodeURIComponent(entity.kind);
    const namespace = encodeURIComponent(
      entity.metadata.namespace ?? 'default',
    );
    const name = encodeURIComponent(entity.metadata.name);

    return this.callApi<CheckmarxEntitySummary>(
      `entities/${kind}/${namespace}/${name}/summary`,
    );
  }

  async getEntitySummaries(
    entities: Entity[],
  ): Promise<(CheckmarxEntitySummary | undefined)[]> {
    if (entities.length === 0) {
      return [];
    }

    const results = await Promise.allSettled(
      entities.map(entity => this.getEntitySummary(entity)),
    );

    return results.map(result =>
      result.status === 'fulfilled' ? result.value : undefined,
    );
  }
}
