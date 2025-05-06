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
import { MessageType } from '@backstage-community/plugin-kiali-common/types';
import { ActionType, createAction } from 'typesafe-actions';
import { ActionKeys } from './ActionKeys';

const DEFAULT_GROUP_ID = 'default';
const DEFAULT_MESSAGE_TYPE = MessageType.ERROR;

type numberOrNumberArray = number | number[];

const toNumberArray = (n: numberOrNumberArray) => (Array.isArray(n) ? n : [n]);

export const MessageCenterActions = {
  addMessage: createAction(
    ActionKeys.MC_ADD_MESSAGE,
    resolve =>
      (
        content: string,
        detail: string,
        groupId: string = DEFAULT_GROUP_ID,
        messageType: MessageType = DEFAULT_MESSAGE_TYPE,
        showNotification: boolean = true,
      ) =>
        resolve({ content, detail, groupId, messageType, showNotification }),
  ),
  removeMessage: createAction(
    ActionKeys.MC_REMOVE_MESSAGE,
    resolve => (messageId: numberOrNumberArray) =>
      resolve({ messageId: toNumberArray(messageId) }),
  ),
  toggleMessageDetail: createAction(
    ActionKeys.MC_TOGGLE_MESSAGE_DETAIL,
    resolve => (messageId: numberOrNumberArray) =>
      resolve({ messageId: toNumberArray(messageId) }),
  ),
  markAsRead: createAction(
    ActionKeys.MC_MARK_MESSAGE_AS_READ,
    resolve => (messageId: numberOrNumberArray) =>
      resolve({ messageId: toNumberArray(messageId) }),
  ),
  toggleGroup: createAction(
    ActionKeys.MC_TOGGLE_GROUP,
    resolve => (groupId: string) => resolve({ groupId }),
  ),
  expandGroup: createAction(
    ActionKeys.MC_EXPAND_GROUP,
    resolve => (groupId: string) => resolve({ groupId }),
  ),
  hideNotification: createAction(
    ActionKeys.MC_HIDE_NOTIFICATION,
    resolve => (messageId: numberOrNumberArray) =>
      resolve({ messageId: toNumberArray(messageId) }),
  ),
  showMessageCenter: createAction(ActionKeys.MC_SHOW),
  hideMessageCenter: createAction(ActionKeys.MC_HIDE),
  toggleExpandedMessageCenter: createAction(ActionKeys.MC_TOGGLE_EXPAND),
};

export type MessageCenterAction = ActionType<typeof MessageCenterActions>;
