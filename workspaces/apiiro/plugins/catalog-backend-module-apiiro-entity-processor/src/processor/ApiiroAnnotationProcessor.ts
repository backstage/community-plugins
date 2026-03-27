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
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  CatalogProcessorCache,
} from '@backstage/plugin-catalog-node';
import type { LocationSpec } from '@backstage/plugin-catalog-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { AuthService, CacheService } from '@backstage/backend-plugin-api';
import {
  APIIRO_METRICS_VIEW_ANNOTATION,
  APIIRO_PROJECT_ANNOTATION,
  APIIRO_APPLICATION_ANNOTATION,
} from '@backstage-community/plugin-apiiro-common';
import { ApiiroApiClient } from '../helpers/apiClient';
import { CacheManager } from '../helpers/cacheManager';
import { extractRepoUrlFromSourceLocation } from '../helpers/utils';
import { BACKSTAGE_SOURCE_LOCATION_ANNOTATION } from '../helpers/types';

export class ApiiroAnnotationProcessor implements CatalogProcessor {
  private readonly apiClient: ApiiroApiClient;
  private readonly cacheManager: CacheManager;
  private readonly catalogApi?: CatalogApi;
  private readonly auth?: AuthService;
  private readonly cache: CacheService;

  constructor(
    private readonly config: Config,
    options: {
      catalogApi?: CatalogApi;
      auth?: AuthService;
      cache: CacheService;
    },
  ) {
    const accessToken = this.config.getOptionalString('apiiro.accessToken');
    this.apiClient = new ApiiroApiClient(accessToken);
    this.catalogApi = options?.catalogApi;
    this.auth = options?.auth;
    this.cache = options.cache;
    this.cacheManager = new CacheManager(
      this.apiClient,
      this.cache,
      this.catalogApi,
      this.auth,
    );
  }

  getProcessorName(): string {
    return 'ApiiroAnnotationProcessor';
  }

  private shouldProcessEntity(entity: Entity): boolean {
    if (entity.kind === 'Component') {
      return true;
    }
    if (entity.kind === 'System' && this.isApplicationsViewEnabled()) {
      return true;
    }
    return false;
  }

  private isApplicationsViewEnabled(): boolean {
    return (
      this.config.getOptionalBoolean('apiiro.enableApplicationsView') ?? false
    );
  }

  private shouldAllowMetricsView(entity: Entity): boolean {
    const exclude =
      this.config.getOptionalBoolean('apiiro.annotationControl.exclude') ??
      true;
    const entityNames =
      this.config
        .getOptionalStringArray('apiiro.annotationControl.entityNames')
        ?.map(name => name.toLowerCase()) ?? [];

    if (entityNames.length === 0) {
      return (
        this.config.getOptionalBoolean('apiiro.defaultAllowMetricsView') ?? true
      );
    }

    const entityRef = stringifyEntityRef(entity);
    const isInList = entityNames.includes(entityRef);

    return exclude ? !isInList : isInList;
  }

  private addApiiroAnnotations(
    entity: Entity,
    repoKey: string | null,
    allowMetricsView: boolean,
    applicationId: string | null,
  ): Record<string, string> {
    const annotations: Record<string, string> = {
      ...entity.metadata?.annotations,
    };

    if (
      repoKey &&
      !Object.keys(annotations).includes(APIIRO_PROJECT_ANNOTATION)
    ) {
      annotations[APIIRO_PROJECT_ANNOTATION] = repoKey;
    }

    if (
      applicationId &&
      !Object.keys(annotations).includes(APIIRO_APPLICATION_ANNOTATION)
    ) {
      annotations[APIIRO_APPLICATION_ANNOTATION] = applicationId;
    }

    if (
      (repoKey ||
        Object.keys(annotations).includes(APIIRO_PROJECT_ANNOTATION) ||
        applicationId ||
        Object.keys(annotations).includes(APIIRO_APPLICATION_ANNOTATION)) &&
      !Object.keys(annotations).includes(APIIRO_METRICS_VIEW_ANNOTATION)
    ) {
      annotations[APIIRO_METRICS_VIEW_ANNOTATION] = allowMetricsView
        ? 'true'
        : 'false';
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

    let repoKey: string | null = null;
    let applicationId: string | null = null;

    if (entity.kind === 'Component') {
      const sourceLocation =
        entity.metadata.annotations?.[BACKSTAGE_SOURCE_LOCATION_ANNOTATION];
      const repoUrl = extractRepoUrlFromSourceLocation(sourceLocation);
      repoKey = repoUrl ? await this.cacheManager.getRepoKey(repoUrl) : null;
    }

    if (entity.kind === 'System' && this.isApplicationsViewEnabled()) {
      const entityRef = stringifyEntityRef(entity);
      let entityUid = await this.cacheManager.getEntityUid(entityRef);

      if (!entityUid) {
        await this.cacheManager.invalidateEntityRefCache();
        entityUid = await this.cacheManager.getEntityUid(entityRef);
      }

      if (entityUid) {
        applicationId = await this.cacheManager.getApplicationId(entityUid);
      }
    }

    const allowMetricsView = this.shouldAllowMetricsView(entity);

    const annotations = this.addApiiroAnnotations(
      entity,
      repoKey,
      allowMetricsView,
      applicationId,
    );

    return {
      ...entity,
      metadata: {
        ...entity.metadata,
        annotations,
      },
    };
  }
}
