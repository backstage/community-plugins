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

import { useCallback, useMemo } from 'react';

import { useOwners } from '@backstage-community/plugin-manage-react';
import {
  CompoundEntityRef,
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import type { JsonValue } from '@backstage/types';

type EntityRefTuple = readonly [string, Entity];

/**
 * Returns a function that can be used to get an owner entity by its reference.
 * This limits the need for EntityRefLink component in the table cells to
 * perform backend calls.
 *
 * The returned function takes a spec.owner field and returns the owner entity
 * or a CompoundEntityRef if the owner is not found.
 *
 * @internal
 */
export function useGetOwnerEntity() {
  const owners = useOwners();

  const ownerEntityByRef = useMemo(() => {
    const userEntities = owners.user
      ? ([[stringifyEntityRef(owners.user), owners.user]] as EntityRefTuple[])
      : ([] as EntityRefTuple[]);
    const groupEntities = owners.groups.map(group => {
      return [stringifyEntityRef(group), group] as EntityRefTuple;
    });

    return new Map<string, Entity>(userEntities.concat(groupEntities));
  }, [owners]);

  const getOwnerEntity = useCallback(
    (owner: JsonValue | undefined): Entity | CompoundEntityRef | undefined => {
      if (typeof owner === 'string') {
        const ownerRef = parseEntityRef(owner, {
          defaultKind: 'group',
        });
        const ownerEntityRef = stringifyEntityRef(ownerRef);
        const ownerEntity = ownerEntityByRef.get(ownerEntityRef);
        return ownerEntity ?? ownerRef;
      }
      return undefined;
    },
    [ownerEntityByRef],
  );

  return getOwnerEntity;
}
