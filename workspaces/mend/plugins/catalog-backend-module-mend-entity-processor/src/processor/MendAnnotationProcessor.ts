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
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  CatalogProcessorCache,
} from '@backstage/plugin-catalog-node';
import type { LocationSpec } from '@backstage/plugin-catalog-common';
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { CacheService, LoggerService } from '@backstage/backend-plugin-api';
import { CacheManager } from '../helpers/cacheManager';
import { extractRepoUrlFromSourceLocation } from '../helpers/utils';
import { MendApiClient } from '../helpers/apiClient';

const MEND_PROJECT_ANNOTATION = 'mend.io/project-ids';
const BACKSTAGE_SOURCE_LOCATION_ANNOTATION = 'backstage.io/source-location';

export class MendAnnotationProcessor implements CatalogProcessor {
  private readonly apiClient: MendApiClient;
  private readonly cacheManager: CacheManager;
  private readonly logger: LoggerService;

  constructor(
    private readonly config: Config,
    options: {
      cache: CacheService;
      logger: LoggerService;
    },
  ) {
    this.logger = options.logger;
    const activationKey = this.config.getOptionalString('mend.activationKey');
    this.apiClient = new MendApiClient(activationKey, this.logger);
    const cacheTTL = this.config.getOptionalNumber('mend.cacheRefresh') ?? 240;
    this.cacheManager = new CacheManager(
      this.apiClient,
      options.cache,
      options.logger,
      cacheTTL,
    );
  }

  getProcessorName(): string {
    return 'MendAnnotationProcessor';
  }

  private shouldProcessEntity(entity: Entity): boolean {
    return (
      entity.kind === 'Component' &&
      !entity.metadata.annotations?.[MEND_PROJECT_ANNOTATION]
    );
  }

  private addMendAnnotations(
    entity: Entity,
    projectIds: string[] | null,
  ): Record<string, string> {
    const annotations: Record<string, string> = {
      ...entity.metadata?.annotations,
    };

    if (projectIds && projectIds.length > 0) {
      annotations[MEND_PROJECT_ANNOTATION] = projectIds.join(',');
    }

    return annotations;
  }

  async preProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
    _originLocation: LocationSpec,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (!this.shouldProcessEntity(entity)) {
      return entity;
    }

    let projectIds: string[] | null = null;

    const sourceLocation =
      entity.metadata.annotations?.[BACKSTAGE_SOURCE_LOCATION_ANNOTATION];
    const repoUrl = extractRepoUrlFromSourceLocation(sourceLocation);

    if (repoUrl) {
      projectIds = await this.cacheManager.getProjectIds(repoUrl);
      if (projectIds) {
        this.logger.debug(
          `Found ${projectIds.length} Mend project(s) for entity ${entity.metadata.name}`,
        );
      }
    }

    const annotations = this.addMendAnnotations(entity, projectIds);

    return {
      ...entity,
      metadata: {
        ...entity.metadata,
        annotations,
      },
    };
  }
}
