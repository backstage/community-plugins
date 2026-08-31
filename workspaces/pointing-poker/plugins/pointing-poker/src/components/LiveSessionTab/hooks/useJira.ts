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
import { useApi } from '@backstage/core-plugin-api';
import type {
  Subtask,
  Ticket,
} from '@backstage-community/plugin-pointing-poker-common';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';

export const useJira = () => {
  const api = useApi(pointingPokerApiRef);

  const getProvider = (): Promise<{ id: string | null }> => api.getProvider();

  const getProjectKey = async (_teamRef: string): Promise<null | string> =>
    null;

  const runJql = (jql: string): Promise<Ticket[]> => api.searchTickets(jql);

  const getSubtasks = (parentKey: string): Promise<Subtask[]> =>
    api.getSubtasks(parentKey);

  // Writes the agreed estimate back to the ticket. Best-effort: a failure here
  // must not block the refinement flow, so it resolves to false.
  const setStoryPoints = (key: string, points: number): Promise<boolean> =>
    api
      .setEstimate(key, points)
      .then(() => true)
      .catch(() => false);

  return { getProjectKey, getProvider, getSubtasks, runJql, setStoryPoints };
};
