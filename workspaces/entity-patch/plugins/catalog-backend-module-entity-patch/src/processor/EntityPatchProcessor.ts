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
import nunjucks from 'nunjucks';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { ScmIntegrations } from '@backstage/integration';
import { createDefaultFilters } from '../templating/filters/createDefaultFilters';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  buildRelationPairs,
  buildPatchConfigs,
} from '@backstage-community/plugin-entity-patch-common';
import { EntityPatcher } from './EntityPatcher';
import { EntityPatchClient } from './EntityPatchClient';

/**
 * Options for constructing EntityPatchProcessor.
 * @public
 */
export interface EntityPatchProcessorOptions {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth: AuthService;
  config: Config;
}

/**
 * A CatalogProcessor that applies saved entity-patch form data back onto
 * entities during catalog ingestion.
 *
 * For each entity, the processor:
 * 1. Reads patch configs from `entityPatch.patches` that match the entity via FilterPredicate
 * 2. Fetches raw saved patch data from the entity-patch API using ETag-based
 *    conditional requests (If-None-Match / 304 Not Modified) to skip unchanged data
 * 3. Applies stored scalar field values onto the entity via `lodash.set` (preProcessEntity)
 * 4. Emits custom bidirectional relations via `processingResult.relation` (postProcessEntity)
 *
 * @public
 */
export class EntityPatchProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly client: EntityPatchClient;
  private readonly patcher: EntityPatcher;

  constructor(options: EntityPatchProcessorOptions) {
    this.logger = options.logger;
    this.client = new EntityPatchClient({
      logger: options.logger,
      discovery: options.discovery,
      auth: options.auth,
    });

    const integrations = ScmIntegrations.fromConfig(options.config);
    const filters = createDefaultFilters({ integrations });
    const nunjucksEnv = new nunjucks.Environment(null as any, {
      autoescape: false,
    });
    for (const { id, filter } of filters) {
      nunjucksEnv.addFilter(id, filter as (...args: any[]) => any);
    }

    this.patcher = EntityPatcher.fromConfigs({
      patchConfigs: buildPatchConfigs(options.config),
      relationPairs: buildRelationPairs(options.config),
      nunjucksEnv,
      logger: this.logger,
    });
  }

  static fromConfig(
    config: Config,
    options: Omit<EntityPatchProcessorOptions, 'config'>,
  ): EntityPatchProcessor {
    return new EntityPatchProcessor({ ...options, config });
  }

  getProcessorName(): string {
    return 'EntityPatchProcessor';
  }

  async preProcessEntity(
    entity: Entity,
    _location: any,
    _emit: any,
    _originLocation: any,
    cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (!this.patcher.hasScalarEntries(entity)) return entity;

    const patchData = await this.client.getPatchData(entity, cache);
    if (!patchData) return entity;

    this.logger.debug('Applied patch data to entity', {
      entityRef: stringifyEntityRef(entity),
    });
    return this.patcher.applyScalars(entity, patchData);
  }

  async postProcessEntity(
    entity: Entity,
    _location: any,
    emit: CatalogProcessorEmit,
    cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (!this.patcher.hasRelationEntries(entity)) return entity;

    const patchData = await this.client.getPatchData(entity, cache);
    if (!patchData) return entity;

    this.patcher
      .resolveRelations(entity, patchData)
      .forEach(rel => emit(processingResult.relation(rel)));

    return entity;
  }
}
