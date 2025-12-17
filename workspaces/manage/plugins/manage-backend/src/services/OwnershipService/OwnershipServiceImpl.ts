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
import { OwnershipService } from '@backstage-community/plugin-manage-node';
import { BackstageCredentials } from '@backstage/backend-plugin-api';
import {
  Entity,
  RELATION_CHILD_OF,
  RELATION_PARENT_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { CatalogService } from '@backstage/plugin-catalog-node';

export class OwnershipServiceImpl implements OwnershipService {
  constructor(private readonly catalogService: CatalogService) {}

  private async getEntitiesByRefs(
    entityRefs: readonly string[],
    credentials: BackstageCredentials,
  ) {
    return (
      await this.catalogService.getEntitiesByRefs(
        {
          entityRefs: Array.from(entityRefs),
        },
        {
          credentials,
        },
      )
    ).items.filter((entity): entity is Entity => !!entity);
  }

  private getRelations(entities: Entity[], relationType: string): string[] {
    return Array.from(
      new Set(
        entities.flatMap(entity =>
          (entity.relations ?? [])
            .filter(rel => rel.type === relationType)
            .map(rel => rel.targetRef),
        ),
      ),
    );
  }

  private async recurseGroups(
    ownershipEntityRefs: readonly string[],
    relationType: string,
    credentials: BackstageCredentials,
  ): Promise<Entity[]> {
    const visited = new Set<string>();
    const result: Entity[] = [];

    let currentRefs = Array.from(ownershipEntityRefs);

    while (currentRefs.length > 0) {
      const entities = await this.getEntitiesByRefs(currentRefs, credentials);

      currentRefs = this.getRelations(
        entities.flatMap(entity => {
          const entityRef = stringifyEntityRef(entity);

          if (visited.has(entityRef) || entity.kind !== 'Group') {
            return [];
          }
          visited.add(entityRef);
          result.push(entity);

          return [entity];
        }),
        relationType,
      ).filter(ref => !visited.has(ref));
    }

    return result;
  }

  // Given a set of ownership entity refs (e.g. direct group memberships),
  // get the parent groups and child groups of each group, recursively.
  public async getOwnedGroups(
    ownershipEntityRefs: readonly string[],
    credentials: BackstageCredentials,
  ): Promise<Entity[]> {
    const entityMap = new Map<string, Entity>();

    const immediateEntities = await this.getEntitiesByRefs(
      ownershipEntityRefs,
      credentials,
    );

    const immediateGroups = immediateEntities.filter(
      entity => entity.kind === 'Group',
    );
    const parentGroupEntityRefs = this.getRelations(
      immediateGroups,
      RELATION_CHILD_OF,
    );
    const childGroupEntityRefs = this.getRelations(
      immediateGroups,
      RELATION_PARENT_OF,
    );

    const [parentGroups, childGroups] = await Promise.all([
      this.recurseGroups(parentGroupEntityRefs, RELATION_CHILD_OF, credentials),
      this.recurseGroups(childGroupEntityRefs, RELATION_PARENT_OF, credentials),
    ]);

    [...immediateEntities, ...childGroups, ...parentGroups].forEach(entity => {
      const entityRef = stringifyEntityRef(entity);
      entityMap.set(entityRef, entity);
    });

    return [...entityMap.values()];
  }
}
