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
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';

import useAsync from 'react-use/lib/useAsync';

import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  Entity,
  RELATION_HAS_MEMBER,
  stringifyEntityRef,
} from '@backstage/catalog-model';

import { queryAncestry } from '../OwnedEntitiesProvider/catalog';

/**
 * This type contains the owned groups and all owner entity refs.
 *
 * @public
 */
export interface Owners {
  groups: Entity[];
  ownedEntityRefs: string[];
}

type OwnedGroupProviderContext = Owners;

const ctx = createContext<OwnedGroupProviderContext>(undefined as any);
const { Provider } = ctx;

/** @internal */
export function OwnedGroupsProvider(props: PropsWithChildren<{}>) {
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const asyncState = useAsync(async () => {
    const identity = await identityApi.getBackstageIdentity();

    const ancestry = orderOwnership(
      await queryAncestry(catalogApi, identity.ownershipEntityRefs),
    );

    return {
      groups: ancestry.filter(entity => entity.kind === 'Group'),
      ownedEntityRefs: ancestry.map(entity => stringifyEntityRef(entity)),
    };
  }, [identityApi]);

  const value = useMemo(
    (): OwnedGroupProviderContext => ({
      groups: asyncState.value?.groups ?? [],
      ownedEntityRefs: asyncState.value?.ownedEntityRefs ?? [],
    }),
    [asyncState],
  );

  if (asyncState.error) {
    return <ErrorPanel error={asyncState.error} />;
  } else if (asyncState.loading) {
    return <Progress />;
  }

  return <Provider value={value}>{props.children}</Provider>;
}

/**
 * Returns the owners of the current user.
 *
 * @public
 */
export function useOwners(): Owners {
  return useContext(ctx);
}

// Order the ownership entities by:
//   1. Immediate group membership
//   2. Groups higher up the group hierarchy
//   3. User
function orderOwnership(entities: Entity[]): Entity[] {
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
