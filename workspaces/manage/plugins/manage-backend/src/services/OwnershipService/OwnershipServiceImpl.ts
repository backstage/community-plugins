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
import {
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';
import {
  Entity,
  RELATION_CHILD_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { CatalogService } from '@backstage/plugin-catalog-node';

export class OwnershipServiceImpl implements OwnershipService {
  constructor(private readonly catalogService: CatalogService) {}

  // Given a set of ownership entity refs (e.g. direct group memberships),
  // get the parent groups of each group, recursively.
  public async getOwnedGroups(
    ownershipEntityRefs: readonly string[],
    credentials: BackstageCredentials<BackstageUserPrincipal>,
  ): Promise<Entity[]> {
    const entityMap = new Map<string, Entity>();

    const recurse = async (children: readonly string[]) => {
      const entities = await this.catalogService.getEntitiesByRefs(
        {
          entityRefs: Array.from(children),
        },
        {
          credentials,
        },
      );

      entities.items
        .filter((entity): entity is Entity => !!entity)
        .forEach(entity => {
          const entityRef = stringifyEntityRef(entity);
          entityMap.set(entityRef, entity);
        });

      const parents = entities.items.flatMap(entity =>
        (entity?.relations || [])
          .filter(rel => rel.type === RELATION_CHILD_OF)
          .map(rel => rel.targetRef),
      );

      const unseenParents = parents.filter(parent => !entityMap.has(parent));

      if (unseenParents.length > 0) {
        await recurse(unseenParents);
      }
    };

    await recurse(ownershipEntityRefs);

    return [...entityMap.values()];
  }
}
