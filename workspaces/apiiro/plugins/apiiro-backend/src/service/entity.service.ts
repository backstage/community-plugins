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
import * as express from 'express';
import {
  HttpAuthService,
  AuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { APIIRO_METRICS_VIEW_ANNOTATION } from '@backstage-community/plugin-apiiro-common';
import type { Entity } from '@backstage/catalog-model';

export type EntityServiceDependencies = {
  httpAuth: HttpAuthService;
  auth: AuthService;
  catalogClient: CatalogClient;
  logger: LoggerService;
};

export class EntityService {
  constructor(private readonly deps: EntityServiceDependencies) {}

  /**
   * Get credentials and catalog token for the request
   */
  async getCredentialsAndToken(req: express.Request) {
    const credentials = await this.deps.httpAuth.credentials(req, {
      allow: ['user', 'service'],
    });
    const { token } = await this.deps.auth.getPluginRequestToken({
      onBehalfOf: credentials,
      targetPluginId: 'catalog',
    });
    return { credentials, token };
  }

  /**
   * Check if user has permission for a specific entity
   */
  async checkPermission(
    req: express.Request,
    entityRef: string,
  ): Promise<{ entity: Entity | null; hasPermission: boolean }> {
    const { entityResponse } = await this.getEntityByRef(req, entityRef);
    if (!entityResponse) {
      return { entity: null, hasPermission: false };
    }

    if (
      entityResponse.metadata?.annotations?.[APIIRO_METRICS_VIEW_ANNOTATION] ===
      'true'
    ) {
      return { entity: entityResponse, hasPermission: true };
    }

    return { entity: entityResponse, hasPermission: false };
  }

  /**
   * Get all entities from the catalog
   */
  async getAllEntities(req: express.Request) {
    const { token } = await this.getCredentialsAndToken(req);

    const entitiesResponse = await this.deps.catalogClient.getEntities(
      { filter: [{ kind: ['Component'] }] },
      { token },
    );

    const entities = entitiesResponse.items;

    this.deps.logger.debug('EntityService - Fetched entities:', {
      entitiesCount: entities.length,
    });

    return { entities, token };
  }

  /**
   * Get all entities from the catalog
   */
  async getEntityByRef(req: express.Request, entityRef: string) {
    const { token } = await this.getCredentialsAndToken(req);

    const entityResponse = await this.deps.catalogClient.getEntityByRef(
      entityRef,
      { token },
    );
    this.deps.logger.debug('EntityService - Fetched entity:', {
      entityResponse,
    });

    return { entityResponse, token };
  }

  /**
   * Optimized method to find entity and check permissions in a single operation
   * Returns object with entity and permission status to avoid double lookups
   */
  async findEntityAndCheckPermission(
    req: express.Request,
    entityRef: string,
  ): Promise<{
    entity: Entity | null;
    hasPermission: boolean;
  }> {
    try {
      const validatePermission = await this.checkPermission(req, entityRef);
      return validatePermission;
    } catch (error) {
      this.deps.logger.error(
        'EntityService - Error in findEntityAndCheckPermission:',
        {
          entityRef,
          error: error instanceof Error ? error.message : String(error),
        },
      );
      return { entity: null, hasPermission: false };
    }
  }

  /**
   * Find entity by repository URL and check access
   * Returns the entity if found and user has access, null otherwise
   */
  async findEntityByRepositoryUrl(req: express.Request, repositoryUrl: string) {
    const { entities } = await this.getAllEntities(req);

    // Find entity that matches the repository URL
    for (const entity of entities) {
      const sourceLocation =
        entity?.metadata?.annotations?.['backstage.io/source-location'];

      if (!sourceLocation) continue;

      // Parse and normalize URLs for comparison
      const normalizedSourceUrl = sourceLocation
        .replace(/^url:/, '')
        .replace(/\.git$/, '')
        .toLowerCase();
      const normalizedRepoUrl = repositoryUrl
        .replace(/\.git$/, '')
        .toLowerCase();

      if (normalizedSourceUrl === normalizedRepoUrl) {
        return entity;
      }
    }

    this.deps.logger.warn(
      'EntityService - No entity found for repository URL:',
      {
        repositoryUrl,
      },
    );

    return null;
  }
}
