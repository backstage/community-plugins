/*
 * Copyright 2025 The Backstage Authors
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
import { Entity, EntityMeta } from '@backstage/catalog-model';
import {
  processingResult,
  CatalogProcessor,
  CatalogProcessorEmit,
  CatalogProcessorCache,
  CatalogProcessorParser,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';

import { LocationSpec } from '@backstage/plugin-catalog-common';

const CACHE_KEY = 'v1';

type CacheItem = {
  etag: string;
  json: any;
};

export class AmplicationTemplatesProcessor implements CatalogProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: RootConfigService,
  ) {
    this.logger.info(`${this.getProcessorName()} is loading...`);
  }

  getProcessorName(): string {
    return 'AmplicationTemplatesProcessor';
  }

  async readLocation(
    location: LocationSpec,
    _optional: boolean,
    emit: CatalogProcessorEmit,
    _parser: CatalogProcessorParser,
    cache: CatalogProcessorCache,
  ): Promise<boolean> {
    if (location.type !== 'amplication') {
      return false;
    }

    const cacheItem = await cache.get<CacheItem>(CACHE_KEY);
    try {
      const response = await this.getCatalog(location);
      const etag = response.headers.get('etag') || 'NO ETAG';

      if (etag !== cacheItem?.etag) {
        const json = await response.json();
        json.data.catalog.data.forEach((item: any) => {
          this.emitComponent(
            item,
            emit,
            location,
            json.data.currentWorkspace.id,
          );
        });

        await cache.set<CacheItem>(CACHE_KEY, {
          etag: etag,
          json: json,
        });
      }
    } catch (error) {
      const message = `Unable to read ${location.type}, ${error}`;
      emit(processingResult.generalError(location, message));
    }

    return true;
  }

  private async getCatalog(location: LocationSpec) {
    const token = this.config.getString('amplication.token');

    return await fetch(location.target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        variables: {
          take: 100,
          skip: 0,
          where: { resourceType: { in: ['ServiceTemplate'] } },
        },
        query: `query searchCatalog($where: ResourceWhereInputWithPropertiesFilter, $take: Int, $skip: Int) {
            currentWorkspace {
                id
            }
            catalog(where: $where, take: $take, skip: $skip) {
                totalCount
                data {
                    id
                    name
                    description
                    resourceType
                    project {
                        id
                        name
                    }
                    blueprint {
                        id
                        name
                    }
                    serviceTemplate {
                        id
                        name
                        projectId
                    }
                    gitRepository {
                        name
                        gitOrganization {
                            name
                            provider
                        }
                    }
                }
                __typename
            }
        }`,
      }),
    });
  }

  private getSanitizedName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-') // Replace any non-alphanumeric characters with a hyphen
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .slice(0, 63); // Truncate to 63 characters
  }

  private emitComponent(
    item: any,
    emit: CatalogProcessorEmit,
    location: LocationSpec,
    workspaceId: string,
  ) {
    const metadata: EntityMeta = {
      name: this.getSanitizedName(item.name),
      title: item.name,
      description: item.description,
      tags: ['amplication', item.resourceType.toLowerCase()],
    };

    const spec = {
      id: item.id,
      type: item.resourceType,
      project: item.project.name,
      project_id: item.project.id,
      blueprint: item.blueprint?.name,
      blueprint_id: item.blueprint?.id,
      lifecycle: 'production',
      providesApis: ['amplication-api'],
      system: 'amplication',
      owner: 'user:amplication-bot',
      workspace: workspaceId,
    } as any;

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: metadata,
      spec: spec,
    };
    emit(processingResult.entity(location, entity));
  }
}
