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

import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { UserEntity } from '@backstage/catalog-model';
import { useAsync } from 'react-use';

export function useUserEmail(kind: string): string | undefined {
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);

  const state = useAsync(async () => {
    if (kind !== 'user') return undefined;

    const profile = await identityApi.getProfileInfo();
    if (profile?.email) return profile.email;

    const identity = await identityApi.getBackstageIdentity();
    const userEntity = (await catalogApi.getEntityByRef(
      identity.userEntityRef,
    )) as UserEntity | undefined;
    return userEntity?.spec?.profile?.email;
  }, [identityApi, catalogApi, kind]);

  return state.value;
}

export default useUserEmail;
