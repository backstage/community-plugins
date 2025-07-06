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
import axios, { AxiosError } from 'axios';
import { Dispatch } from 'react';
import { KialiAppAction } from '../actions/KialiAppAction';
import { MessageCenterActions } from '../actions/MessageCenterActions';
import * as API from '../services/Api';

export type Message = {
  content: string;
  detail?: string;
  group?: string;
  type?: MessageType;
  showNotification?: boolean;
};

export const extractAxiosError = (
  message: string,
  error: AxiosError,
): { content: string; detail: string } => {
  const errorString: string = API.getErrorString(error);
  const errorDetail: string = API.getErrorDetail(error);
  if (message) {
    // combine error string and detail into a single detail
    if (errorString && errorDetail) {
      return {
        content: message,
        detail: `${errorString}\nAdditional Detail:\n${errorDetail}`,
      };
    } else if (errorDetail) {
      return { content: message, detail: errorDetail };
    }
    return { content: message, detail: errorString };
  }
  return { content: errorString, detail: errorDetail };
};

export class AlertUtils {
  dispatch: Dispatch<KialiAppAction>;

  constructor(dispatch: Dispatch<KialiAppAction>) {
    this.dispatch = dispatch;
  }

  add = (content: string, group?: string, type?: MessageType) => {
    this.dispatch(MessageCenterActions.addMessage(content, '', group, type));
  };

  addInfo = (
    content: string,
    showNotification?: boolean,
    group?: string,
    detail?: string,
  ) => {
    this.dispatch(
      MessageCenterActions.addMessage(
        content,
        detail ?? '',
        group,
        MessageType.INFO,
        showNotification,
      ),
    );
  };

  addSuccess = (
    content: string,
    showNotification?: boolean,
    group?: string,
    detail?: string,
  ) => {
    this.dispatch(
      MessageCenterActions.addMessage(
        content,
        detail ?? '',
        group,
        MessageType.SUCCESS,
        showNotification,
      ),
    );
  };

  addWarning = (
    content: string,
    showNotification?: boolean,
    group?: string,
    detail?: string,
  ) => {
    this.dispatch(
      MessageCenterActions.addMessage(
        content,
        detail ?? '',
        group,
        MessageType.WARNING,
        showNotification,
      ),
    );
  };

  addMessage = (msg: Message) => {
    this.dispatch(
      MessageCenterActions.addMessage(
        msg.content,
        msg.detail ?? '',
        msg.group,
        msg.type,
        msg.showNotification,
      ),
    );
  };

  addError = (
    message: string,
    error?: Error,
    group?: string,
    type?: MessageType,
    detail?: string,
  ) => {
    if (axios.isAxiosError(error)) {
      const finalType: MessageType = type ?? MessageType.ERROR;
      const err = extractAxiosError(message, error);
      this.addMessage({
        ...err,
        group: group,
        type: finalType,
      });
    } else {
      this.dispatch(
        MessageCenterActions.addMessage(
          message,
          detail ?? '',
          group,
          MessageType.ERROR,
        ),
      );
    }
  };
}
