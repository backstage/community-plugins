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
import { Namespace } from '@backstage-community/plugin-kiali-common/types';
import {
  ActionType,
  createAction,
  createStandardAction,
} from 'typesafe-actions';
import { ActionKeys } from './ActionKeys';

export const NamespaceActions = {
  toggleActiveNamespace: createStandardAction(
    ActionKeys.TOGGLE_ACTIVE_NAMESPACE,
  )<Namespace>(),
  setActiveNamespaces: createStandardAction(ActionKeys.SET_ACTIVE_NAMESPACES)<
    Namespace[]
  >(),
  setFilter: createStandardAction(ActionKeys.NAMESPACE_SET_FILTER)<string>(),
  requestStarted: createAction(ActionKeys.NAMESPACE_REQUEST_STARTED),
  requestFailed: createAction(ActionKeys.NAMESPACE_FAILED),
  receiveList: createAction(
    ActionKeys.NAMESPACE_SUCCESS,
    resolve => (newList: Namespace[], receivedAt: Date) =>
      resolve({
        list: newList,
        receivedAt: receivedAt,
      }),
  ),
};

export type NamespaceAction = ActionType<typeof NamespaceActions>;
