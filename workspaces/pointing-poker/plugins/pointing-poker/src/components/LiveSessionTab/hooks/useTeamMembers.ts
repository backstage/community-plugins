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
import { useAsync } from 'react-use';
import {
  RELATION_HAS_MEMBER,
  RELATION_MEMBER_OF,
} from '@backstage/catalog-model';
import type { GroupEntity, UserEntity } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

export const useTeamMembers = (selectedTeam: string) => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);

  const { value: currentUserData } = useAsync(async () => {
    const identity = await identityApi.getBackstageIdentity();
    const userEntity = (await catalogApi.getEntityByRef(
      identity.userEntityRef,
    )) as UserEntity | undefined;

    const teamRefs =
      userEntity?.relations
        ?.filter(r => r.type === RELATION_MEMBER_OF)
        .map(r => r.targetRef) ?? [];

    const teams = await Promise.all(
      teamRefs.map(async ref => {
        const group = (await catalogApi.getEntityByRef(ref)) as
          | GroupEntity
          | undefined;
        return {
          name:
            group?.spec?.profile?.displayName ??
            group?.metadata.title ??
            group?.metadata.name ??
            ref,
          ref,
        };
      }),
    );

    return {
      currentUser: userEntity,
      userTeams: teams,
    };
  }, [catalogApi, identityApi]);

  const { loading, value: participants } = useAsync(async () => {
    if (!selectedTeam) {
      return [];
    }

    const group = (await catalogApi.getEntityByRef(selectedTeam)) as
      | GroupEntity
      | undefined;
    const memberRefs =
      group?.relations
        ?.filter(r => r.type === RELATION_HAS_MEMBER)
        .map(r => r.targetRef) ?? [];
    if (memberRefs.length === 0) {
      return [];
    }

    const response = await catalogApi.getEntitiesByRefs({
      entityRefs: memberRefs,
    });
    return response.items.filter((entity): entity is UserEntity =>
      Boolean(entity),
    );
  }, [catalogApi, selectedTeam]);

  return {
    currentUser: currentUserData?.currentUser,
    loading,
    participants,
    userTeams: currentUserData?.userTeams,
  };
};
