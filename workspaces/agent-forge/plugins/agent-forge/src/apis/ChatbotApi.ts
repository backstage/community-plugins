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

import { A2AClient } from '../a2a/client'; // Import necessary types
import { v4 as uuidv4 } from 'uuid'; // Example for generating task IDs
import {
  MessageSendParams,
  SendMessageResponse,
  Task,
  TextPart,
} from '../a2a/schema';
import { IdentityApi } from '@backstage/core-plugin-api';

export interface IChatbotApiOptions {}

export class ChatbotApi {
  private client: A2AClient | null = null;
  private contextId: string;
  private identityApi: IdentityApi;
  constructor(
    private apiBaseUrl: string,
    options: { identityApi: IdentityApi },
    _?: IChatbotApiOptions,
  ) {
    this.contextId = '';
    if (!this.apiBaseUrl) {
      throw new Error('Agent URL is not provided');
    }
    this.identityApi = options.identityApi;
    try {
      this.client = new A2AClient(this.apiBaseUrl);
    } catch (error) {
      throw new Error('Error connecting to agent');
    }
  }

  public async submitA2ATask(newContext: boolean, msg: string) {
    try {
      const msgId = uuidv4();
      const { token } = await this.identityApi.getCredentials();

      const sendParams: MessageSendParams = {
        message: {
          messageId: msgId,
          role: 'user',
          parts: [{ text: msg, kind: 'text' }],
          kind: 'message',
        },
      };
      if (!newContext && this.contextId !== undefined) {
        sendParams.message.contextId = this.contextId;
      }
      // Method now returns Task | null directly
      const taskResult: SendMessageResponse | undefined =
        await this.client?.sendMessage(sendParams, token);

      const task: Task = taskResult?.result as Task;

      this.contextId = task.contextId;
      const status = task.status.state;
      let result: string | undefined = '';
      if (status === 'completed') {
        if (task.artifacts) {
          const part = task.artifacts[0].parts[0] as TextPart;
          result = part.text;
        }
      } else {
        const part = task.status.message?.parts[0] as TextPart;
        result = part.text;
      }

      return result;
    } catch (error) {
      // console.log(error)
      return 'Error connecting to agent';
    }
  }
}
