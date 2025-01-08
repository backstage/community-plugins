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
  CatalogApi,
  GetEntitiesRequest,
  GetEntitiesResponse,
} from '@backstage/catalog-client';
import {
  CompoundEntityRef,
  Entity,
  getCompoundEntityRef,
  isComponentEntity,
  RELATION_HAS_PART,
  RELATION_MEMBER_OF,
  RELATION_OWNER_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { getEntityRelations } from '@backstage/plugin-catalog-react';
import { TechInsightsClient } from '@backstage-community/plugin-tech-insights';
import {
  BulkMaturityCheckResponse,
  BulkMaturitySummary,
  MaturityCheckResult,
  MaturityRank,
  MaturitySummary,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { ScoringDataApi } from './ScoringDataApi';
import { ScoringDataFormatter } from './ScoringDataFormatter';

const SDF = new ScoringDataFormatter();

export class ScoringDataClient implements ScoringDataApi {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
  catalogApi: CatalogApi;
  techInsightsClient: TechInsightsClient;

  constructor({
    catalogApi,
    discoveryApi,
    identityApi,
  }: {
    catalogApi: CatalogApi;
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
  }) {
    this.catalogApi = catalogApi;
    this.discoveryApi = discoveryApi;
    this.identityApi = identityApi;
    this.techInsightsClient = new TechInsightsClient({
      discoveryApi,
      identityApi,
    });
  }

  public async getMaturityRank(entity: Entity): Promise<MaturityRank> {
    const checksResult = await this.getCheckResults(entity);
    return SDF.getMaturityRank(checksResult);
  }

  public async getMaturityCheckResults(
    entity: Entity,
  ): Promise<MaturityCheckResult[]> {
    const results = await this.getCheckResults(entity);
    return Promise.all(
      results.map(async x => {
        // Get facts information
        const fact = await this.techInsightsClient.getFacts(
          getCompoundEntityRef(entity),
          x.check.factIds,
        );
        return {
          ...x,
          updated: Object.values(fact)[0].timestamp,
        };
      }),
    );
  }

  public async getBulkMaturityCheckResults(
    entities: Entity[],
  ): Promise<BulkMaturityCheckResponse> {
    return await this.getBulkCheckResults(
      entities.map(x => getCompoundEntityRef(x)),
    );
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
      return (await this.techInsightsClient.runChecks(
        getCompoundEntityRef(entity),
      )) as MaturityCheckResult[];
    }

    const entities = await this.getRelatedComponents(entity);
    return await this.getGroupCheckResults(entities);
  }

  private async getBulkCheckResults(entities: CompoundEntityRef[]) {
    const bulkResponse = await this.techInsightsClient.runBulkChecks(entities);
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
    const bulkResponse = await this.techInsightsClient.runBulkChecks(entities);
    for (const response of bulkResponse) {
      Array.prototype.push.apply(results, response.results);
    }

    return results;
  }

  private async getRelatedComponents(
    entity: Entity,
  ): Promise<CompoundEntityRef[]> {
    switch (entity.kind) {
      case 'System':
        return this.getComponentsForSystem(entity);
      case 'Domain':
        return this.getComponentsForDomain(entity.metadata.name);
      case 'Group':
        return this.getComponentsForGroup(entity);
      case 'User':
        return this.getComponentsForUser(entity);
      default:
        return [];
    }
  }

  private async getComponentsForSystem(
    entity: Entity,
  ): Promise<CompoundEntityRef[]> {
    return getEntityRelations(entity, RELATION_HAS_PART, { kind: 'Component' });
  }

  private async getComponentsForDomain(
    domainName: string,
  ): Promise<CompoundEntityRef[]> {
    const request: GetEntitiesRequest = {
      filter: [
        {
          kind: 'component',
          'metadata.annotations.mdsol/domain': domainName,
        },
      ],
    };
    const response: GetEntitiesResponse = await this.catalogApi.getEntities(
      request,
    );
    return response.items.map(x => getCompoundEntityRef(x));
  }

  private async getComponentsForOrganization(): Promise<CompoundEntityRef[]> {
    // Getting all component entities would be the fastest
    const request: GetEntitiesRequest = {
      filter: [{ kind: 'component' }],
    };
    const response: GetEntitiesResponse = await this.catalogApi.getEntities(
      request,
    );
    return response.items.map(x => getCompoundEntityRef(x));
  }

  private async getComponentsSolutonLine(
    entity: Entity,
  ): Promise<CompoundEntityRef[]> {
    const components: CompoundEntityRef[] = [];

    const domains = getEntityRelations(entity, RELATION_OWNER_OF, {
      kind: 'Domain',
    });
    for (const domain of domains) {
      Array.prototype.push.apply(
        components,
        await this.getComponentsForDomain(domain.name),
      );
    }

    return components;
  }

  private async getComponentsForGroup(
    entity: Entity,
  ): Promise<CompoundEntityRef[]> {
    if (entity.spec?.type === 'solution-line') {
      return this.getComponentsSolutonLine(entity);
    } else if (entity.spec?.type === 'organization') {
      return this.getComponentsForOrganization();
    }

    return getEntityRelations(entity, RELATION_OWNER_OF, { kind: 'Component' });
  }

  private async getComponentsForUser(
    entity: Entity,
  ): Promise<CompoundEntityRef[]> {
    const teams = getEntityRelations(entity, RELATION_MEMBER_OF, {
      kind: 'Group',
    });
    const components = teams.map(async team => {
      const teamEntity = await this.catalogApi.getEntityByRef(team);
      return getEntityRelations(teamEntity, RELATION_OWNER_OF, {
        kind: 'Component',
      });
    });

    return (await Promise.all(components)).flat();
  }
}