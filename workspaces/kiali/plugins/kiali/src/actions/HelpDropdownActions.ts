/*
 * Copyright 2024 The Backstage Authors
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
import { ActionType, createAction } from 'typesafe-actions';
import { StatusState } from '../types/StatusState';
import { ActionKeys } from './ActionKeys';

export const HelpDropdownActions: { [key: string]: any } = {
  statusRefresh: createAction(
    ActionKeys.HELP_STATUS_REFRESH,
    resolve => (status: StatusState) =>
      resolve({
        status: status.status,
        externalServices: status.externalServices,
        warningMessages: status.warningMessages,
        istioEnvironment: status.istioEnvironment,
      }),
  ),
};

export type HelpDropdownAction = ActionType<typeof HelpDropdownActions>;
