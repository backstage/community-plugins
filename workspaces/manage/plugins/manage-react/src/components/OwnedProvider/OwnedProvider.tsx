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
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

import useAsync from 'react-use/lib/useAsync';

import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { ErrorPanel, Progress } from '@backstage/core-components';

import { useKindOrder } from '../KindOrder';
import { arrayify, joinKinds } from '../../utils';
import { defaultKinds } from './types';
import {
  type KindStarredType,
  KindStarred,
} from '../CurrentKindProvider/types';
import { Owners, manageApiRef } from '../../api';

interface OwnedEntitiesProviderContext {
  kinds: string[];
  owners: Owners;
  entities: Entity[];
  starredEntities: Entity[];
}

const ctx = createContext<OwnedEntitiesProviderContext>(undefined as any);
const { Provider } = ctx;

export interface OwnedProviderProps {
  kinds?: string[];
}

export function OwnedProvider(props: PropsWithChildren<OwnedProviderProps>) {
  const { kinds = defaultKinds } = props;

  const { starredEntities: starredEntityRefs } = useStarredEntities();

  const catalogApi = useApi(catalogApiRef);
  const manageApi = useApi(manageApiRef);

  const asyncState = useAsync(
    async () => manageApi.getOwnersAndEntities(kinds),
    [kinds],
  );

  const starredEntityRefList = Array.from(starredEntityRefs);
  const starredEntities = useAsync(async (): Promise<Entity[]> => {
    return (
      await catalogApi.getEntitiesByRefs({
        entityRefs: starredEntityRefList,
      })
    ).items.filter((v): v is NonNullable<typeof v> => !!v);
  }, [starredEntityRefList.join(' $ ')]);

  const value = useMemo(
    (): OwnedEntitiesProviderContext => ({
      kinds,
      owners: asyncState.value?.owners ?? { groups: [], ownedEntityRefs: [] },
      entities: asyncState.value?.ownedEntities ?? [],
      starredEntities: starredEntities.value ?? [],
    }),
    [kinds, asyncState.value, starredEntities],
  );

  if (asyncState.loading || starredEntities.loading) {
    return <Progress />;
  } else if (asyncState.error) {
    return <ErrorPanel error={asyncState.error} />;
  }

  return <Provider value={value}>{props.children}</Provider>;
}

/**
 * Returns the owners of the current user.
 *
 * @public
 */
export function useOwners(): Owners {
  return useContext(ctx).owners;
}

/**
 * Return all kinds given to <ManagePage>
 *
 * @param onlyOwned - Only return kinds for entities actually owned, otherwise
 * all configured kinds
 *
 * @public
 */
export function useOwnedKinds(onlyOwned = false): string[] {
  const { kinds, entities } = useContext(ctx);

  const ownedEntities = useMemo(
    () =>
      new Set(
        !onlyOwned
          ? []
          : (entities ?? []).map(entity =>
              entity.kind.toLocaleLowerCase('en-US'),
            ),
      ),
    [onlyOwned, entities],
  );

  return useMemo(() => {
    if (!onlyOwned) {
      return kinds;
    }

    return kinds.filter(kind => {
      const lcKind = kind.toLocaleLowerCase('en-US');
      return ownedEntities.has(lcKind);
    });
  }, [onlyOwned, kinds, ownedEntities]);
}

/**
 * Returns all owned entities, possibly filtered by kind.
 *
 * By default all owned entities are returned, but by passing a kind (or array
 * of kinds), only those will be returned. There is a special kind `KindStarred`
 * exported by this package, will reflects the starred entities.
 *
 * @public
 */
export function useOwnedEntities(
  kind?: string | KindStarredType | (string | KindStarredType)[],
): Entity[] {
  const { kinds: ownedKinds, entities, starredEntities } = useContext(ctx);

  const kinds = arrayify(kind ?? ownedKinds);
  const orderedKinds = useKindOrder(kinds);

  return useMemo(
    (): Entity[] => {
      const lcKinds = orderedKinds.map(curKind =>
        typeof curKind === 'symbol'
          ? curKind
          : curKind?.toLocaleLowerCase('en-US'),
      );

      const filteredEntities = (entities ?? []).filter(entity =>
        lcKinds.includes(entity.kind.toLocaleLowerCase('en-US')),
      );
      return lcKinds.flatMap(curKind =>
        curKind === KindStarred
          ? starredEntities
          : filteredEntities.filter(
              entity => entity.kind.toLocaleLowerCase('en-US') === curKind,
            ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [joinKinds(orderedKinds), entities, starredEntities],
  );
}

/**
 * Returns all managed entites, i.e. owned entities and starred entities.
 *
 * @public
 */
export function useManagedEntities(): Entity[] {
  const { entities, starredEntities } = useContext(ctx);

  return useMemo((): Entity[] => {
    const set = new Set<string>();
    return ([] as Entity[]).concat(entities, starredEntities).filter(entity => {
      const entityRef = stringifyEntityRef(entity);
      if (set.has(entityRef)) {
        return false;
      }
      set.add(entityRef);
      return true;
    });
  }, [entities, starredEntities]);
}
