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
  RELATION_HAS_MEMBER,
  stringifyEntityRef,
} from '@backstage/catalog-model';

// Order the ownership entities by:
//   1. Immediate group membership
//   2. Groups higher up the group hierarchy
//   3. User
export function orderOwnership(entities: Entity[]): Entity[] {
  const decoratedEntities = entities.map(entity => ({
    entity,
    title: (entity.metadata.title ?? entity.metadata.name).toLocaleLowerCase(
      'en-US',
    ),
    kind: entity.kind.toLocaleLowerCase('en-US'),
  }));

  const userEntity = decoratedEntities.find(
    entity => entity.kind === 'user',
  )?.entity;
  const userEntityRef = userEntity ? stringifyEntityRef(userEntity) : undefined;

  return decoratedEntities
    .sort((a, b) => {
      if (a.kind === 'user') return 1;
      else if (b.kind === 'user') return -1;

      const directOwnedA = a.entity.relations?.some(
        rel =>
          rel.type === RELATION_HAS_MEMBER && rel.targetRef === userEntityRef,
      );

      const directOwnedB = b.entity.relations?.some(
        rel =>
          rel.type === RELATION_HAS_MEMBER && rel.targetRef === userEntityRef,
      );

      if (directOwnedA && directOwnedB) return 0;
      else if (directOwnedA) return -1;
      else if (directOwnedB) return 1;

      return a.title.localeCompare(b.title);
    })
    .map(({ entity }) => entity);
}
