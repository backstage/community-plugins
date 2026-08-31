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
import { useApi } from '@backstage/core-plugin-api';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';

export const useTicketInfo = (ticketKey?: string) => {
  const api = useApi(pointingPokerApiRef);

  const { value: ticket } = useAsync(async () => {
    if (!ticketKey) {
      return undefined;
    }
    return api.getTicket(ticketKey);
  }, [api, ticketKey]);

  return ticket;
};
