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
export interface Message {
  text?: string; // Make optional to support A2A messages
  parts?: Array<{
    kind: string;
    text?: string;
    [key: string]: any;
  }>; // Add A2A parts support
  isUser: boolean;
  options?: string[];
  suggestions?: string[];
  timestamp?: string; // Add this line
  renderOptions?: boolean; // Add this line
  metadata?: {
    user_input?: boolean;
    form_explanation?: string;
    input_fields?:
      | {
          // Legacy structure
          field_name: string;
          field_description: string;
          field_values?: string[];
        }[]
      | {
          // New structure
          fields: {
            name: string;
            type: string;
            title: string;
            description: string;
            required: boolean;
            status: string;
            provided_value?: string | boolean | number;
          }[];
          summary: {
            total_required: number;
            total_optional: number;
            provided_required: number;
            provided_optional: number;
            missing_required: number;
          };
          tool_info?: {
            name: string;
            description: string;
            operation: string;
          };
          context?: {
            missing_required_count: number;
            total_fields_count: number;
            extracted_count: number;
            conversation_context: {
              original_query: string;
              tool_name: string;
              timestamp: number;
              a2a_context_id: string;
              stable_conversation_id: string;
            };
            is_followup: boolean;
            stable_conversation_id: string;
          };
        };
  };
}

export interface Feedback {
  type?: string;
  reason?: string;
  additionalFeedback?: string;
  showFeedbackOptions?: boolean;
  promptForFeedback?: boolean;
  submitted?: boolean;
}

export type AnswerResponse = {
  answer: string;
  metadata?: {
    user_input?: boolean;
    form_explanation?: string;
    input_fields?:
      | {
          // Legacy structure
          field_name: string;
          field_description: string;
          field_values?: string[];
        }[]
      | {
          // New structure
          fields: {
            name: string;
            type: string;
            title: string;
            description: string;
            required: boolean;
            status: string;
            provided_value?: string | boolean | number;
          }[];
          summary: {
            total_required: number;
            total_optional: number;
            provided_required: number;
            provided_optional: number;
            missing_required: number;
          };
          tool_info?: {
            name: string;
            description: string;
            operation: string;
          };
          context?: {
            missing_required_count: number;
            total_fields_count: number;
            extracted_count: number;
            conversation_context: {
              original_query: string;
              tool_name: string;
              timestamp: number;
              a2a_context_id: string;
              stable_conversation_id: string;
            };
            is_followup: boolean;
            stable_conversation_id: string;
          };
        };
  };
};

export type SuggestionResponse = {
  suggestions: string[];
};

export type EmptyResponse = {};

export interface IQuestionResponse {
  answer?: string;
  suggestions?: string[];
  metadata?: {
    user_input?: boolean;
    form_explanation?: string;
    input_fields?:
      | {
          // Legacy structure
          field_name: string;
          field_description: string;
          field_values?: string[];
        }[]
      | {
          // New structure
          fields: {
            name: string;
            type: string;
            title: string;
            description: string;
            required: boolean;
            status: string;
            provided_value?: string | boolean | number;
          }[];
          summary: {
            total_required: number;
            total_optional: number;
            provided_required: number;
            provided_optional: number;
            missing_required: number;
          };
          tool_info?: {
            name: string;
            description: string;
            operation: string;
          };
          context?: {
            missing_required_count: number;
            total_fields_count: number;
            extracted_count: number;
            conversation_context: {
              original_query: string;
              tool_name: string;
              timestamp: number;
              a2a_context_id: string;
              stable_conversation_id: string;
            };
            is_followup: boolean;
            stable_conversation_id: string;
          };
        };
  };
}

export enum ApiStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export interface IQuestionConfirmResponse extends IQuestionResponse {
  status: ApiStatus;
}

export interface ISubmitResponse extends IQuestionResponse {
  status: ApiStatus;
}

export interface IQuestionSubmitResponse extends ISubmitResponse {
  chat_id: string;
  run_id: string;
}

export interface IAnswerResponse extends ISubmitResponse {}

export interface IQuestionTask {
  chat_id: string;
  question: string;
}

export enum UserResponse {
  NEW = 'new',
  CONTINUE = 'continue',
  RESET = 'reset',
}
