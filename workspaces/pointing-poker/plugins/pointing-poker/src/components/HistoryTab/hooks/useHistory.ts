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
import { useAsyncRetry } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import type { Session } from '@backstage-community/plugin-pointing-poker-common';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';

export const useHistory = (teamRefs: string[]) => {
  const api = useApi(pointingPokerApiRef);
  const key = teamRefs.join(',');

  return useAsyncRetry(async () => {
    if (!key) {
      return [] as Session[];
    }
    return api.getHistorySessions(key.split(','));
  }, [api, key]);
};
