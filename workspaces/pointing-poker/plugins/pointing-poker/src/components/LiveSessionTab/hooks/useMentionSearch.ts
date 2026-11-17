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
import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import type { ProviderUser } from '@backstage-community/plugin-pointing-poker-common';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';

export type MentionUser = ProviderUser;

export const useMentionSearch = (query: null | string) => {
  const api = useApi(pointingPokerApiRef);
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setUsers([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const result = await api.searchUsers(query);
        if (!cancelled) {
          setUsers(result);
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [api, query]);

  return { loading, users };
};
