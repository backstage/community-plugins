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
import axios, { AxiosError } from 'axios';
import {
  IQuestionSubmitResponse,
  ApiStatus,
  IAnswerResponse,
  IQuestionTask,
} from '../types';

import {
  A2AClient,
  Task,
  TaskQueryParams,
  TaskSendParams,
} from '../a2a/client'; // Import necessary types
import { v4 as uuidv4 } from 'uuid'; // Example for generating task IDs

export interface IChatbotApi {
  submitQuestion(
    chatId: string,
    runId: string,
    question: string,
  ): Promise<IQuestionSubmitResponse>;
  getAnswer(chatId: string, runId: string): Promise<IAnswerResponse>;
}

const ANSWER_NOT_AVAILABLE = 'Answer not available yet';

export interface IChatbotApiOptions {}

export class ChatbotApi implements IChatbotApi {
  private client: A2AClient | null = null;
  constructor(
    private apiBaseUrl: string,
    private agentId: string,
    private apiKey: string,
    _?: IChatbotApiOptions,
  ) {
    if (!this.apiBaseUrl) {
      throw new Error('AGENTFORGE_BACKEND_URL is not provided');
    }
    if (!this.agentId) {
      this.client = new A2AClient(this.apiBaseUrl);
    }
  }

  public async submitA2ATask(msg) {
    try {
      // Send a simple task (pass only params)
      const taskId = uuidv4();
      const msgId = uuidv4();
      const sendParams: TaskSendParams = {
        id: taskId,
        message: {
          messageId: msgId,
          role: 'user',
          parts: [{ text: msg, type: 'text' }],
        },
      };
      // Method now returns Task | null directly
      const taskResult: Task | null = await this.client.sendTask(sendParams);
      // console.log("Send Task Result:", taskResult);

      const status = taskResult.status.state;

      // console.log(status);
      let result = '';
      if (status === 'completed') {
        result = taskResult.artifacts[0].parts[0].text;
      } else {
        result = taskResult.status.message.parts[0].text;
      }

      return result;
    } catch (error) {
      // console.error("A2A Client Error:", error);
      return '';
    }
  }

  public async submitQuestion(
    chatId: string,
    question: string,
  ): Promise<IQuestionSubmitResponse> {
    try {
      const questionTask: IQuestionTask = {
        chat_id: chatId,
        question: question,
      };
      // console.log('Submitting question with task:', questionTask);
      const { data } = await axios.post<{
        run: {
          run_id: string;
          thread_id: string;
          agent_id: string;
          created_at: string;
          updated_at: string;
          status: string;
          creation: object;
        };
        output: {
          type: string;
          values: {
            messages: Array<{
              content: string;
              additional_kwargs?: object;
              response_metadata?: object;
              type: string;
              name?: string;
              id: string;
              example?: boolean;
              tool_calls?: Array<object>;
              invalid_tool_calls?: Array<object>;
              usage_metadata?: object;
            }>;
          };
        };
      }>(
        `${this.apiBaseUrl}/runs`,
        {
          ...questionTask,
          agent_id: this.agentId,
          // Provide the payload to be sent-----
          input: {
            input: {
              messages: [
                {
                  type: 'human',
                  content: question,
                },
              ],
            },
          },
          config: {},
        },
        //-------------------------------------
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          // Ignore CORS by setting withCredentials to false
          withCredentials: false,
        },
      );
      // console.log('Received response from API:', data);
      return {
        status: ApiStatus.SUCCESS,
        chat_id: data.run_id || '',
        run_id: data.run_id || '',
      };
    } catch (error) {
      const err = error as AxiosError;
      // console.error('Error occurred while submitting question:', err.message);
      if (err?.isAxiosError) {
        // console.error('Axios error details:', {
        //  message: err.message,
        //  cause: err.cause?.message,
        //  responseData: err.response?.data,
        // });
        throw new Error(
          `Error submitting a question: ${[err.message, err.cause?.message]
            .filter(Boolean)
            .join(' - ')}`,
        );
      }
      throw new Error(err.message);
    }
  }

  public async getAnswer(
    chatId: string,
    runId: String,
  ): Promise<IAnswerResponse> {
    try {
      const { data } = await axios.get<IAnswerResponse>(
        `${this.apiBaseUrl}/runs/${runId}/wait`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
        },
      );
      // console.log(data)

      const outputType = data.output.type;
      if (outputType === 'error') {
        throw new Error('Please refine your request');
        // throw new Error(data.output.description);
      }

      // Adapt to retrieve the response
      const messages = data.output.values.output.messages;

      const response = messages[messages.length - 1].content;

      if (response === ANSWER_NOT_AVAILABLE) {
        return {
          status: ApiStatus.SUCCESS,
          answer: response,
        };
      }
      return {
        status: ApiStatus.SUCCESS,
        answer: this.cleanData(response || ''),
        suggestions: data.suggestions || [],
        metadata: data.metadata || {},
      };
    } catch (error) {
      const err = error as AxiosError;
      if (err?.isAxiosError) {
        throw new Error(
          `Error getting the answer: ${[err.message, err.cause?.message]
            .filter(Boolean)
            .join(' - ')}`,
        );
      }
      throw new Error(err.message);
    }
  }

  private cleanData(data: string): string {
    return data.replace(/user:default\//g, '');
  }
}
