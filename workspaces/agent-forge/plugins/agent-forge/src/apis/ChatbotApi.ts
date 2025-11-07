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

import { A2AClient, A2AStreamEventData } from '../a2a/client'; // Import necessary types
import { v4 as uuidv4 } from 'uuid'; // Example for generating task IDs
import {
  MessageSendParams,
  SendMessageResponse,
  Task,
  AgentCard,
} from '../a2a/schema';
import { IdentityApi, OpenIdConnectApi } from '@backstage/core-plugin-api';

export interface IChatbotApiOptions {
  requestTimeout?: number;
  useOpenIDToken?: boolean;
}

export class ChatbotApi {
  private client: A2AClient | null = null;
  private contextId: string;
  private identityApi: IdentityApi;
  private openIdConnectApi: OpenIdConnectApi;
  private useOpenIDToken: boolean;
  constructor(
    private apiBaseUrl: string,
    options: { identityApi: IdentityApi; openIdConnectApi: OpenIdConnectApi },
    apiOptions?: IChatbotApiOptions,
  ) {
    this.contextId = '';
    if (!this.apiBaseUrl) {
      throw new Error('Agent URL is not provided');
    }
    this.identityApi = options.identityApi;
    this.openIdConnectApi = options.openIdConnectApi;
    this.useOpenIDToken = apiOptions?.useOpenIDToken ?? false; // default to false which means use IdentityApi.getCredentials() (backstage token)
    try {
      const timeout = apiOptions?.requestTimeout ?? 300; // Default to 300 seconds
      this.client = new A2AClient(this.apiBaseUrl, timeout);
    } catch (error) {
      throw new Error('Error connecting to agent');
    }
  }

  private async getToken(): Promise<string | undefined> {
    if (this.useOpenIDToken) {
      return await this.openIdConnectApi.getIdToken();
    }
    const credentials = await this.identityApi.getCredentials();
    return credentials.token;
  }

  public async submitA2ATask(
    newContext: boolean,
    msg: string,
    sessionContextId?: string,
  ) {
    try {
      const msgId = uuidv4();
      const token = await this.getToken();

      const sendParams: MessageSendParams = {
        message: {
          messageId: msgId,
          role: 'user',
          parts: [{ text: msg, kind: 'text' }],
          kind: 'message',
        },
      };

      // Use session contextId if provided, otherwise use internal contextId
      const contextToUse = sessionContextId || this.contextId;
      if (!newContext && contextToUse !== undefined) {
        sendParams.message.contextId = contextToUse;
      }
      // Method now returns Task | null directly
      const taskResult: SendMessageResponse | undefined =
        await this.client?.sendMessage(sendParams, token);

      const task: Task = taskResult?.result as Task;

      this.contextId = task.context_id;

      // Return the full task response instead of just the text
      return task;
    } catch (error) {
      // console.log(error)
      throw new Error('Error connecting to agent');
    }
  }

  public async *submitA2ATaskStream(
    newContext: boolean,
    msg: string,
    sessionContextId?: string,
  ): AsyncGenerator<A2AStreamEventData, void, undefined> {
    try {
      const msgId = uuidv4();
      const sendParams: MessageSendParams = {
        message: {
          messageId: msgId,
          role: 'user',
          parts: [{ text: msg, kind: 'text' }],
          kind: 'message',
        },
      };
      const token = await this.getToken();

      // Use session contextId if provided, otherwise use internal contextId
      const contextToUse = sessionContextId || this.contextId;
      if (!newContext && contextToUse !== undefined) {
        sendParams.message.contextId = contextToUse;
      }

      // Stream responses using SSE
      if (this.client) {
        for await (const event of this.client.sendMessageStream(
          sendParams,
          token,
        )) {
          // Update internal contextId from streamed events
          if (event.kind === 'task' && event.contextId) {
            this.contextId = event.contextId;
          }
          yield event;
        }
      }
    } catch (error) {
      console.error('STREAMING ERROR:', error);
      throw error; // Let the real error bubble up instead of masking it
    }
  }

  public async getSkillExamples() {
    const card: AgentCard | undefined = await this.client?.getAgentCard();
    try {
      return card?.skills[0].examples;
    } catch (error) {
      return [];
    }
  }

  public async cancelTask(taskId: string): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('A2A client not initialized');
      }
      const { token } = await this.identityApi.getCredentials();
      await this.client.cancelTask({ taskId }, token);
      console.log('✅ A2A cancellation sent for task:', taskId);
    } catch (error) {
      console.error('❌ Failed to send A2A cancellation:', error);
      // Don't throw - cancellation is best-effort
    }
  }
}
