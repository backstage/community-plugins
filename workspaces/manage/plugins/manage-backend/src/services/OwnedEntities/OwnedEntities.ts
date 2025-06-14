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
  Entity,
  parseEntityRef,
  RELATION_OWNER_OF,
} from '@backstage/catalog-model';
import { CatalogService } from '@backstage/plugin-catalog-node';

import { OwnedEntitiesService } from '@backstage-community/plugin-manage-node';
import {
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';

export class OwnedEntitiesImpl implements OwnedEntitiesService {
  constructor(private readonly catalog: CatalogService) {}

  async getOwnedEntitiesByOwnerEntities(
    ownerEntities: readonly Entity[],
    entityKind: readonly string[],
    credentials: BackstageCredentials<BackstageUserPrincipal>,
  ): Promise<Entity[]> {
    const lcKinds = new Set(
      entityKind.map(kind => kind.toLocaleLowerCase('en-US')),
    );

    // Given all owner entities, extract the relations to owned entities
    const ownedEntityRefs = Array.from(
      new Set(
        ownerEntities.flatMap(entity =>
          (entity.relations ?? [])
            .filter(rel => {
              if (rel.type !== RELATION_OWNER_OF) {
                return false;
              }
              return (
                lcKinds.size === 0 ||
                lcKinds.has(
                  parseEntityRef(rel.targetRef).kind.toLocaleLowerCase('en-US'),
                )
              );
            })
            .map(rel => rel.targetRef),
        ),
      ),
    );

    const { items } = await this.catalog.getEntitiesByRefs(
      {
        entityRefs: ownedEntityRefs,
      },
      { credentials },
    );
    return items.filter((v): v is NonNullable<typeof v> => !!v);
  }
}
