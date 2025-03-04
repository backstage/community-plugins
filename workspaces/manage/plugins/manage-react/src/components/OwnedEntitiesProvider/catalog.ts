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
import type { PromiseElement } from 'already';

import {
  Entity,
  stringifyEntityRef,
  RELATION_OWNED_BY,
} from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/plugin-catalog-react';

import { arrayify } from '../../utils';

/**
 * Finds all parents (groups) of a set of entity refs.
 * This will include pseudo groups.
 */
export async function queryAncestry(
  catalogApi: CatalogApi,
  entityRefs: string[],
): Promise<Entity[]> {
  const entityMap = new Map<string, Entity>();

  const recurse = async (children: string[]) => {
    const entities = await catalogApi.getEntitiesByRefs({
      entityRefs: children,
    });

    entities.items
      .filter((entity): entity is Entity => !!entity)
      .forEach(entity => {
        const entityRef = stringifyEntityRef(entity);
        entityMap.set(entityRef, entity);
      });

    const parents = entities.items.flatMap(entity =>
      (entity?.relations || [])
        .filter(rel => rel.type === 'childOf')
        .map(rel => rel.targetRef),
    );

    const unseenParents = parents.filter(parent => !entityMap.has(parent));

    if (unseenParents.length > 0) {
      await recurse(unseenParents);
    }
  };

  await recurse(entityRefs);

  return [...entityMap.values()];
}

async function getOwnedEntitiesByOwnedRef(
  catalogApi: CatalogApi,
  entityKind: string | string[],
  ownerEntityRef: string,
): Promise<Entity[]> {
  const items: Entity[] = [];
  let ancestry: PromiseElement<ReturnType<typeof catalogApi.queryEntities>>;

  ancestry = await catalogApi.queryEntities({
    filter: {
      'relations.ownedBy': ownerEntityRef,
      kind: entityKind,
    },
  });
  items.push(...ancestry.items);

  while (ancestry.pageInfo.nextCursor && ancestry.items.length > 0) {
    ancestry = await catalogApi.queryEntities({
      cursor: ancestry.pageInfo.nextCursor,
    });
    items.push(...ancestry.items);
  }

  return items;
}

async function getOwnedEntitiesByOwnedRefs(
  catalogApi: CatalogApi,
  entityKind: string | string[],
  ownerEntityRefs: string[],
): Promise<Entity[]> {
  const entities: Entity[][] = [];
  await Promise.all(
    // Querying the entities concurrently is way faster than combining them into
    // a single filter array in one call (a factor of over 100x).
    // Probably a backend implementation issue, or that it has to re-create
    // combined cursors.
    ownerEntityRefs.map(async ownerEntityRef => {
      const items = await getOwnedEntitiesByOwnedRef(
        catalogApi,
        entityKind,
        ownerEntityRef,
      );
      entities.push(items);
    }),
  );

  return ([] as Entity[]).concat(...entities);
}

/**
 * Finds all entities of a certain kind, owned by a set of entity refs.
 *
 * Sorts the result to the same order as the owner entity refs, and internally
 * within the same owner entity ref according to the title/name.
 */
export async function getOwnedEntities(
  catalogApi: CatalogApi,
  entityKind: string | string[],
  ownerEntityRefs: string[],
): Promise<Entity[]> {
  const items = await getOwnedEntitiesByOwnedRefs(
    catalogApi,
    entityKind,
    ownerEntityRefs,
  );

  const kinds = Array.from(
    new Set([
      ...arrayify(entityKind).map(kind => kind.toLocaleLowerCase('en-US')),
      ...items.map(entity => entity.kind.toLocaleLowerCase('en-US')),
    ]),
  );

  const lookupItems = items.map(entity => ({
    entity,
    kind: entity.kind.toLocaleLowerCase('en-US'),
    relOwnedBy: entity.relations
      ?.find(rel => rel.type === RELATION_OWNED_BY)
      ?.targetRef?.toLocaleLowerCase('en-US'),
    title: (entity.metadata.title ?? entity.metadata.name).toLocaleLowerCase(
      'en-US',
    ),
  }));

  return (
    lookupItems
      // Sort the found entities by the:
      //  1. Order of the entity kind
      //  2. Order of the entity owner
      //  3. Order of the entity title
      .sort((a, b) => {
        if (a.kind !== b.kind) {
          return kinds.indexOf(a.kind) < kinds.indexOf(b.kind) ? -1 : 1;
        }

        const aOwner = a.relOwnedBy;
        const bOwner = b.relOwnedBy;

        if (aOwner === bOwner) {
          return a.title.localeCompare(b.title);
        }

        if (!aOwner) return -1;
        if (!bOwner) return 1;

        const aIndex = ownerEntityRefs.indexOf(aOwner);
        const bIndex = ownerEntityRefs.indexOf(bOwner);
        if (aIndex === -1) return -1;
        if (bIndex === -1) return 1;
        return aIndex - bIndex;
      })
      .map(({ entity }) => entity)
  );
}
