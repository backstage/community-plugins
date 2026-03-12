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

/**
 * @internal
 */
export interface LlamaStackFileResponse {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  expires_at?: number;
  filename: string;
  purpose: string;
}

/**
 * @internal
 */
export interface LlamaStackVectorStoreFileResponse {
  id: string;
  object: string;
  status: 'completed' | 'in_progress' | 'failed' | 'cancelled';
  created_at: number;
  last_error?: { code: string; message: string } | null;
  usage_bytes: number;
  vector_store_id: string;
}

/**
 * @internal
 */
export interface LlamaStackVectorStoreResponse {
  id: string;
  object: string;
  name: string;
  status: string;
  created_at?: number;
  file_counts: {
    total: number;
    completed: number;
    in_progress: number;
    failed: number;
    cancelled: number;
  };
}

/**
 * Responses API output event types
 * @internal
 */
export interface ResponsesApiFileSearchResult {
  type: 'file_search_call';
  id: string;
  status: string;
  queries: string[];
  results: Array<{
    file_id: string;
    filename: string;
    score: number;
    text: string;
    attributes: Record<string, unknown>;
  }>;
}

/**
 * MCP tool call result from Responses API
 * @internal
 */
export interface ResponsesApiMcpCall {
  type: 'mcp_call';
  id: string;
  name: string;
  arguments: string;
  server_label: string;
  error?: string;
  output?: string;
}

/**
 * @internal
 */
export interface ResponsesApiMessage {
  type: 'message';
  id: string;
  role: 'assistant';
  status: 'completed' | 'failed';
  content: Array<{
    type: 'output_text';
    text: string;
    annotations?: unknown[];
  }>;
}

/**
 * @internal
 */
export type ResponsesApiOutputEvent =
  | ResponsesApiFileSearchResult
  | ResponsesApiMcpCall
  | ResponsesApiMessage;

/**
 * File search tool format for Responses API
 * @internal
 */
export interface ResponsesApiFileSearchTool {
  type: 'file_search';
  vector_store_ids: string[];
  /** Maximum number of chunks returned by file_search (1-50, Llama Stack default: 10) */
  max_num_results?: number;
  /** Ranking/filtering options for search results */
  ranking_options?: {
    /** Ranker strategy: 'weighted', 'rrf', or 'neural' */
    ranker?: string;
    /** Minimum relevance score (0.0-1.0); chunks below this are dropped */
    score_threshold?: number;
  };
}

/**
 * MCP tool format for Responses API
 * @internal
 */
export interface ResponsesApiMcpTool {
  type: 'mcp';
  server_url: string;
  server_label: string;
  /** HITL approval requirement - maps directly to Llama Stack API */
  require_approval:
    | 'never'
    | 'always'
    | { always?: string[]; never?: string[] };
  headers?: Record<string, string>;
  /** Restrict which tools from this server are exposed to the model.
   *  Llama Stack accepts plain string[] or AllowedToolsFilter { tool_names }. */
  allowed_tools?: string[];
}

/**
 * Function tool format for Responses API
 * Defines a custom function the model can call
 * @internal
 */
export interface ResponsesApiFunctionTool {
  type: 'function';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  strict?: boolean;
}

/**
 * Web search tool format for Responses API
 * Built-in tool for searching the web
 * @internal
 */
export interface ResponsesApiWebSearchTool {
  type: 'web_search';
}

/**
 * Code interpreter tool format for Responses API
 * Built-in tool for executing Python code
 * @internal
 */
export interface ResponsesApiCodeInterpreterTool {
  type: 'code_interpreter';
}

/**
 * Union type for all Responses API tools
 * @internal
 */
export type ResponsesApiTool =
  | ResponsesApiFileSearchTool
  | ResponsesApiMcpTool
  | ResponsesApiFunctionTool
  | ResponsesApiWebSearchTool
  | ResponsesApiCodeInterpreterTool;
