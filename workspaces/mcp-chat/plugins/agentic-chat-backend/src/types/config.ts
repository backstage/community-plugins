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

import type { BrandingConfig } from '@backstage-community/plugin-agentic-chat-common';
import type { MCPServerConfig } from './security';

/**
 * Effective configuration resolved at request time by merging
 * YAML baseline with admin DB overrides. All chat-time config
 * consumers should read from this interface, not from cached
 * service fields.
 *
 * @public
 */
export interface EffectiveConfig {
  /** LLM model identifier */
  model: string;
  /** Llama Stack server URL */
  baseUrl: string;
  /** System prompt injected as instructions */
  systemPrompt: string;
  /** Tool choice strategy */
  toolChoice?: ToolChoiceConfig;
  /** Allow the model to invoke multiple tools in one turn */
  parallelToolCalls?: boolean;
  /** Structured output format */
  textFormat?: {
    type: 'json_schema';
    json_schema: {
      name: string;
      schema: Record<string, unknown>;
      strict?: boolean;
    };
  };
  /** Enable built-in web search tool */
  enableWebSearch: boolean;
  /** Enable built-in code interpreter tool */
  enableCodeInterpreter: boolean;
  /** Max chunks returned by file_search */
  fileSearchMaxResults?: number;
  /** Minimum relevance score threshold for file_search */
  fileSearchScoreThreshold?: number;
  /** Active vector store IDs for RAG */
  vectorStoreIds: string[];
  /** Vector store name for auto-creation */
  vectorStoreName: string;
  /** Embedding model */
  embeddingModel: string;
  /** Embedding dimension */
  embeddingDimension: number;
  /** Search mode */
  searchMode?: 'semantic' | 'keyword' | 'hybrid';
  /** BM25 weight for hybrid search */
  bm25Weight?: number;
  /** Semantic weight for hybrid search */
  semanticWeight?: number;
  /** Chunking strategy */
  chunkingStrategy: 'auto' | 'static';
  /** Max chunk size in tokens */
  maxChunkSizeTokens: number;
  /** Chunk overlap in tokens */
  chunkOverlapTokens: number;
  /** Skip TLS verification */
  skipTlsVerify: boolean;
  /** Zero Data Retention mode */
  zdrMode: boolean;
  /** Custom function definitions */
  functions?: FunctionDefinition[];
  /** API authentication token */
  token?: string;
  /** Verbose stream logging */
  verboseStreamLogging: boolean;
  /** Destructive action patterns for safety */
  safetyPatterns?: string[];
  /** Branding overrides */
  branding?: Partial<BrandingConfig>;
  /** Additional MCP servers added via admin UI (merged with YAML) */
  mcpServers?: MCPServerConfig[];
  /** MCP proxy URL override from admin UI */
  mcpProxyUrl?: string;
  /** Override safety enabled/disabled from admin panel */
  safetyEnabled?: boolean;
  /** Override input shield IDs from admin panel */
  inputShields?: string[];
  /** Override output shield IDs from admin panel */
  outputShields?: string[];
  /** Override evaluation enabled/disabled from admin panel */
  evaluationEnabled?: boolean;
  /** Override scoring function IDs from admin panel */
  scoringFunctions?: string[];
  /** Override minimum score threshold from admin panel */
  minScoreThreshold?: number;
  /** Override safety onError behavior from admin panel ('allow' = fail-open, 'block' = fail-closed) */
  safetyOnError?: 'allow' | 'block';
  /** Override evaluation onError behavior from admin panel ('skip' = ignore errors, 'fail' = report errors) */
  evaluationOnError?: 'skip' | 'fail';
  /**
   * Reasoning configuration for models that support thinking (Gemini 2.5+, o1/o3, etc.)
   * Maps to the OpenAI Responses API `reasoning` parameter.
   * Llama Stack translates this to provider-specific params (e.g. Gemini thinking_level).
   */
  reasoning?: ReasoningConfig;
}

/**
 * Reasoning configuration for the OpenAI Responses API.
 * Controls how much thinking a model performs before responding.
 * @public
 */
export interface ReasoningConfig {
  /** How much reasoning effort the model should apply */
  effort?: 'low' | 'medium' | 'high';
  /**
   * Controls reasoning summary output in streaming responses.
   * - 'auto': Server decides (default)
   * - 'concise': Brief summaries
   * - 'detailed': Full reasoning summaries
   * - 'none': No summaries
   */
  summary?: 'auto' | 'concise' | 'detailed' | 'none';
}

/**
 * Allowed tool specification for filtering available tools
 * @public
 */
export type AllowedToolSpec =
  | { type: 'file_search' }
  | { type: 'web_search' }
  | { type: 'code_interpreter' }
  | { type: 'mcp'; server_label: string }
  | { type: 'function'; name: string };

/**
 * Tool choice configuration for Responses API
 * Controls how the model selects which tools to use
 * @public
 */
export type ToolChoiceConfig =
  | 'auto' // Model decides when to call tools (default)
  | 'required' // Model must call at least one tool
  | 'none' // Model cannot call any tools
  | { type: 'function'; name: string } // Force a specific function
  | {
      type: 'allowed_tools';
      mode?: 'auto' | 'required';
      tools: AllowedToolSpec[];
    }; // Restrict to specific tools

/**
 * Configuration for Llama Stack integration
 * Uses Llama Stack's OpenAI-compatible APIs with Responses API for RAG
 * @public
 */
export interface LlamaStackConfig {
  /** Base URL for the Llama Stack server */
  baseUrl: string;
  /** IDs of vector stores to search (supports multiple for automatic multi-store RAG) */
  vectorStoreIds: string[];
  /** Name for auto-created vector store (required if vectorStoreIds not provided) */
  vectorStoreName: string;
  /** Embedding model for vector store (e.g., 'sentence-transformers/all-MiniLM-L6-v2') */
  embeddingModel: string;
  /** Embedding dimension (e.g., 384 for all-MiniLM-L6-v2, 768 for text-embedding-004) */
  embeddingDimension?: number;
  /**
   * Vector store search mode for RAG retrieval
   * - 'semantic': Pure embedding-based search (default)
   * - 'keyword': Pure BM25 keyword search
   * - 'hybrid': Combines semantic and keyword search for better results
   */
  searchMode?: 'semantic' | 'keyword' | 'hybrid';
  /**
   * Weight for BM25 keyword search in hybrid mode (0.0 - 1.0)
   * Only used when searchMode is 'hybrid'
   * Default: 0.5
   */
  bm25Weight?: number;
  /**
   * Weight for semantic/embedding search in hybrid mode (0.0 - 1.0)
   * Only used when searchMode is 'hybrid'
   * Default: 0.5
   */
  semanticWeight?: number;
  /** LLM model to use for Responses API (e.g., 'gemini/gemini-2.5-flash') */
  model: string;
  /** Optional API token for authentication */
  token?: string;
  /** Chunking strategy for file uploads: 'auto' or 'static' */
  chunkingStrategy: 'auto' | 'static';
  /** Max chunk size in tokens (for static chunking) */
  maxChunkSizeTokens: number;
  /** Chunk overlap in tokens (for static chunking) */
  chunkOverlapTokens: number;
  /** Skip TLS certificate verification (for self-signed certs in dev/enterprise) */
  skipTlsVerify?: boolean;
  /** Enable verbose logging for streaming events (default: false) */
  verboseStreamLogging?: boolean;
  /**
   * Tool choice configuration - controls how the model selects tools
   * - 'auto': Model decides when to call tools (default)
   * - 'required': Model must call at least one tool
   * - 'none': Model cannot call any tools
   * - { type: 'function', name: '...' }: Force a specific function
   */
  toolChoice?: ToolChoiceConfig;
  /**
   * Whether to allow parallel tool calls
   * - true: Model can call multiple tools in a single turn (default)
   * - false: Model can only call one tool at a time
   */
  parallelToolCalls?: boolean;
  /**
   * Structured output format configuration
   * When set, the model will return output conforming to the JSON schema
   */
  textFormat?: {
    type: 'json_schema';
    json_schema: {
      name: string;
      schema: Record<string, unknown>;
      strict?: boolean;
    };
  };
  /**
   * Custom function definitions for the model to call
   * These are added to the tools array alongside file_search and MCP tools
   */
  functions?: FunctionDefinition[];
  /**
   * Enable Zero Data Retention (ZDR) mode
   * When enabled:
   * - Responses are not stored (store: false)
   * - Encrypted reasoning tokens are returned for stateless operation
   * - Pass encrypted tokens back in subsequent requests
   */
  zdrMode?: boolean;
  /**
   * Maximum number of chunks returned by file_search per query (1-50).
   * Lower values reduce input tokens; higher values provide more context.
   * Llama Stack default is 10 when not specified.
   */
  fileSearchMaxResults?: number;
  /**
   * Minimum relevance score for file_search results (0.0-1.0).
   * Chunks scoring below this threshold are dropped before being sent to the model.
   * 0.0 means no filtering (default), 0.3-0.5 is a reasonable starting point.
   */
  fileSearchScoreThreshold?: number;
  /**
   * Enable the built-in web_search tool
   * When enabled, the model can search the web for real-time information
   */
  enableWebSearch?: boolean;
  /**
   * Enable the built-in code_interpreter tool
   * When enabled, the model can execute Python code for data analysis
   */
  enableCodeInterpreter?: boolean;
  /**
   * Reasoning / thinking configuration.
   * Enables and controls the model's internal chain-of-thought.
   * - effort: 'low' | 'medium' | 'high' — maps to Gemini thinking_level or OpenAI reasoning effort
   * - summary: 'auto' | 'concise' | 'detailed' | 'none' — controls reasoning summary output
   */
  reasoning?: ReasoningConfig;
}

/**
 * Function definition for Responses API
 * Defines a custom function the model can call
 * @public
 */
export interface FunctionDefinition {
  /** Function name (e.g., 'search_catalog') */
  name: string;
  /** Description of what the function does and when to use it */
  description: string;
  /** JSON Schema defining the function's input parameters */
  parameters: Record<string, unknown>;
  /** Whether to enforce strict mode for schema compliance (default: true) */
  strict?: boolean;
}
