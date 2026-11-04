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
import { useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import type { UserEntity } from '@backstage/catalog-model';
import type { ProviderUser } from '@backstage-community/plugin-pointing-poker-common';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';

export type MentionProviderUser = ProviderUser;

// Resolves id -> provider user -> catalog User (by email), once, when `enabled`
// first turns true.
export const useMentionUser = (
  accountId: string | undefined,
  enabled: boolean,
) => {
  const api = useApi(pointingPokerApiRef);
  const catalogApi = useApi(catalogApiRef);
  const [jiraUser, setJiraUser] = useState<ProviderUser | null>(null);
  const [entity, setEntity] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !accountId || startedRef.current) {
      return undefined;
    }
    startedRef.current = true;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const user = await api.getUser(accountId);
        if (cancelled) {
          return;
        }
        setJiraUser(user);

        if (user?.email) {
          const entities = await catalogApi.getEntities({
            filter: {
              kind: 'User',
              'spec.profile.email': user.email,
            },
          });
          if (!cancelled) {
            setEntity((entities.items[0] as UserEntity) ?? null);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accountId, api, catalogApi, enabled]);

  return { entity, jiraUser, loading };
};
