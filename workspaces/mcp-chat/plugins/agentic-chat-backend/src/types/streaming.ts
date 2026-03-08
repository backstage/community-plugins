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

import type { ResponseUsage } from '@backstage-community/plugin-agentic-chat-common';

/**
 * Base streaming event - all events have a type
 * @public
 */
export interface StreamingEventBase {
  type: string;
  sequence_number?: number;
}

/**
 * Response created event - marks the start of processing
 * @public
 */
export interface StreamingResponseCreated extends StreamingEventBase {
  type: 'response.created';
  response: {
    id: string;
    model: string;
    status: string;
    created_at: number;
    output: unknown[];
  };
}

/**
 * Output item added - a new tool call or message started
 * @public
 */
export interface StreamingOutputItemAdded extends StreamingEventBase {
  type: 'response.output_item.added';
  response_id: string;
  output_index: number;
  item: {
    id: string;
    type: string;
    name?: string;
    status: string;
    call_id?: string;
    arguments?: string;
  };
}

/**
 * Function call arguments streaming
 * @public
 */
export interface StreamingFunctionCallDelta extends StreamingEventBase {
  type: 'response.function_call_arguments.delta';
  item_id: string;
  output_index: number;
  delta: string;
}

/**
 * Function call arguments complete
 * @public
 */
export interface StreamingFunctionCallDone extends StreamingEventBase {
  type: 'response.function_call_arguments.done';
  item_id: string;
  output_index: number;
  arguments: string;
}

/**
 * Output item done - tool call completed with results
 * @public
 */
export interface StreamingOutputItemDone extends StreamingEventBase {
  type: 'response.output_item.done';
  response_id: string;
  output_index: number;
  item: {
    id: string;
    type: string;
    name?: string;
    status: string;
    queries?: string[];
    results?: Array<{
      text: string;
      filename?: string;
      score?: number;
      attributes?: Record<string, unknown>;
    }>;
    output?: string;
    error?: string;
    server_label?: string;
    arguments?: string;
  };
}

/**
 * Content part added - text generation starting
 * @public
 */
export interface StreamingContentPartAdded extends StreamingEventBase {
  type: 'response.content_part.added';
  response_id: string;
  item_id: string;
  part: {
    type: string;
    text: string;
  };
}

/**
 * Text delta - streaming text token
 * @public
 */
export interface StreamingTextDelta extends StreamingEventBase {
  type: 'response.output_text.delta';
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

/**
 * Content part done - text generation complete
 * @public
 */
export interface StreamingContentPartDone extends StreamingEventBase {
  type: 'response.content_part.done';
  response_id: string;
  item_id: string;
  part: {
    type: string;
    text: string;
  };
}

/**
 * Response completed - all done
 * @public
 */
export interface StreamingResponseCompleted extends StreamingEventBase {
  type: 'response.completed';
  response: {
    id: string;
    model: string;
    status: string;
    created_at: number;
    output: unknown[];
    usage?: ResponseUsage;
  };
}

/**
 * Union type for all streaming events
 * @public
 */
export type StreamingEvent =
  | StreamingResponseCreated
  | StreamingOutputItemAdded
  | StreamingFunctionCallDelta
  | StreamingFunctionCallDone
  | StreamingOutputItemDone
  | StreamingContentPartAdded
  | StreamingTextDelta
  | StreamingContentPartDone
  | StreamingResponseCompleted;
