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
import { Request } from 'express';
import {
  HttpAuthService,
  AuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';

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
  async getCredentialsAndToken(req: Request) {
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
   * Get all entities from the catalog
   */
  async getAllEntities(req: Request) {
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
   * Get an entity from the catalog
   */
  async getEntityByRef(req: Request, entityRef: string) {
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
}
