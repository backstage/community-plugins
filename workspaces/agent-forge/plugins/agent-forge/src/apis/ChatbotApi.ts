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

import { A2AClient, Task } from '../a2a/client'; // Import necessary types
import { v4 as uuidv4 } from 'uuid'; // Example for generating task IDs
import { MessageSendParams } from '../a2a/schema';

export interface IChatbotApiOptions {}

export class ChatbotApi {
  private client: A2AClient | null = null;
  private contextId: string;
  constructor(private apiBaseUrl: string, _?: IChatbotApiOptions) {
    this.contextId = '';
    if (!this.apiBaseUrl) {
      throw new Error('Agent URL is not provided');
    }
    try {
      this.client = new A2AClient(this.apiBaseUrl);
    } catch (error) {
      throw new Error('Error connecting to agent');
    }
  }

  public async submitA2ATask(newContext: boolean, msg: string) {
    try {
      // Send a simple task (pass only params)
      const msgId = uuidv4();
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
      const taskResult: Task | null = await this.client?.sendMessage(
        sendParams,
      );
      this.contextId = taskResult.result.contextId;
      const status = taskResult.result.status.state;
      let result = '';
      if (status === 'completed') {
        result = taskResult.result.artifacts[0].parts[0].text;
      } else {
        result = taskResult.result.status.message.parts[0].text;
      }

      return result;
    } catch (error) {
      return 'Error connecting to agent';
    }
  }
}
