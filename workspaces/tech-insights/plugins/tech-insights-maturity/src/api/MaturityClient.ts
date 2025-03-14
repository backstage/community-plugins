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
import { CatalogApi } from '@backstage/catalog-client';
import {
  CompoundEntityRef,
  Entity,
  getCompoundEntityRef,
  isComponentEntity,
  RELATION_HAS_PART,
  RELATION_OWNER_OF,
  RELATION_PARENT_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { getEntityRelations } from '@backstage/plugin-catalog-react';
import { TechInsightsClient } from '@backstage-community/plugin-tech-insights-react';
import {
  BulkMaturityCheckResponse,
  BulkMaturitySummary,
  MaturityCheckResult,
  MaturityRank,
  MaturityScore,
  MaturitySummary,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { MaturityApi } from './MaturityApi';
import { ScoringDataFormatter } from './ScoringDataFormatter';
import { BulkCheckResponse } from '@backstage-community/plugin-tech-insights-common';

const SDF = new ScoringDataFormatter();
const DEFAULT_CHUNKSIZE = 1000;

/**
 * MaturityClient extension of TechInsightsClient
 *
 * @public
 */
export class MaturityClient extends TechInsightsClient implements MaturityApi {
  readonly catalogApi: CatalogApi;
  readonly chunkSize: number;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    catalogApi: CatalogApi;
    chunkSize?: number;
  }) {
    super(options);
    this.catalogApi = options.catalogApi;
    this.chunkSize = options.chunkSize || DEFAULT_CHUNKSIZE;
  }

  public async getMaturityRank(entity: Entity): Promise<MaturityRank> {
    const checksResult = await this.getCheckResults(entity);
    return SDF.getMaturityRank(checksResult);
  }

  public async getBulkMaturityCheckResults(
    entities: Entity[],
  ): Promise<BulkMaturityCheckResponse> {
    return await this.getBulkCheckResults(
      entities.map(x => getCompoundEntityRef(x)),
    );
  }

  public async getMaturityScore(entity: Entity): Promise<MaturityScore> {
    const checks = await this.getCheckResults(entity);
    const rank = SDF.getMaturityRank(checks);
    const summary = SDF.getMaturitySummary(checks);
    return {
      checks,
      summary,
      rank,
    };
  }

  public async getChildMaturityCheckResults(
    entity: Entity,
  ): Promise<BulkMaturityCheckResponse> {
    const entities = await this.getRelatedComponents(entity);
    return await this.getBulkCheckResults(entities);
  }

  public async getMaturitySummary(entity: Entity): Promise<MaturitySummary> {
    const checksResult = await this.getCheckResults(entity);
    return SDF.getMaturitySummary(checksResult);
  }

  public async getBulkMaturitySummary(
    entities: Entity[],
  ): Promise<BulkMaturitySummary> {
    return Promise.all(
      entities.map(async x => {
        const checks = await this.getCheckResults(x);
        const summary = SDF.getMaturitySummary(checks);
        const rank = SDF.getMaturityRank(checks);

        return {
          entity: stringifyEntityRef(x),
          rank: rank.rank,
          isMaxRank: rank.isMaxRank,
          summary,
        };
      }),
    );
  }

  private async getCheckResults(
    entity: Entity,
  ): Promise<MaturityCheckResult[]> {
    if (isComponentEntity(entity)) {
      return (await this.runChecks(
        getCompoundEntityRef(entity),
      )) as MaturityCheckResult[];
    }

    const entities = await this.getRelatedComponents(entity);
    return await this.getGroupCheckResults(entities);
  }

  private async getBulkCheckResults(entities: CompoundEntityRef[]) {
    let bulkResponse: BulkCheckResponse = [];
    for (let i = 0; i < entities.length; i += this.chunkSize) {
      const chunk = entities.slice(i, i + this.chunkSize);
      const response = await this.runBulkChecks(chunk);
      bulkResponse = bulkResponse.concat(response);
    }
    return Promise.all(
      bulkResponse.map(async x => {
        const checks = x.results as MaturityCheckResult[];
        const rank = SDF.getMaturityRank(checks);

        return {
          entity: x.entity,
          rank: rank.rank,
          isMaxRank: rank.isMaxRank,
          checks,
        };
      }),
    );
  }

  private async getGroupCheckResults(
    entities: CompoundEntityRef[],
  ): Promise<MaturityCheckResult[]> {
    /**
     * Passing an empty array into techInsightsClient.runBulkChecks()
     * now causes checks to run across the entire catalog.
     * We don't want to run checks here if no entities were provided.
     */
    if (entities.length === 0) {
      return [];
    }

    const results: MaturityCheckResult[] = [];
    let bulkResponse: BulkCheckResponse = [];
    for (let i = 0; i < entities.length; i += this.chunkSize) {
      const chunk = entities.slice(i, i + this.chunkSize);
      const response = await this.runBulkChecks(chunk);
      bulkResponse = bulkResponse.concat(response);
    }
    for (const response of bulkResponse) {
      Array.prototype.push.apply(results, response.results);
    }

    return results;
  }

  private async getRelatedComponents(
    entity: Entity,
  ): Promise<CompoundEntityRef[]> {
    if (!entity?.kind) {
      return [];
    }
    switch (entity.kind) {
      case 'System':
        return getEntityRelations(entity, RELATION_HAS_PART);
      case 'Domain':
        return await this.getRelatedComponentsByRefs(
          getEntityRelations(entity, RELATION_HAS_PART),
        );
      case 'Group':
        return this.getComponentsForGroup(entity);
      default:
        return [getCompoundEntityRef(entity)];
    }
  }

  private async getComponentsForGroup(
    entity: Entity,
  ): Promise<CompoundEntityRef[]> {
    const childEntities = getEntityRelations(entity, RELATION_PARENT_OF);
    if (childEntities.length > 0) {
      return await this.getRelatedComponentsByRefs(childEntities);
    }
    const entityPartsRef = getEntityRelations(entity, RELATION_OWNER_OF);
    return await this.getRelatedComponentsByRefs(entityPartsRef);
  }

  private async getRelatedComponentsByRefs(refs: CompoundEntityRef[]) {
    const { items } = await this.catalogApi.getEntitiesByRefs({
      entityRefs: refs.map(x => stringifyEntityRef(x)),
    });

    const entityParts: CompoundEntityRef[] = [];
    for (const item of items) {
      Array.prototype.push.apply(
        entityParts,
        await this.getRelatedComponents(item!),
      );
    }
    return entityParts;
  }
}
