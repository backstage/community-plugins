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

// ---------------------------------------------------------------------------
// Timeout constants (milliseconds unless suffixed with _S for seconds)
// ---------------------------------------------------------------------------

/** API request timeout for synchronous LLM inference calls. */
export const API_REQUEST_TIMEOUT_MS = 120_000;

/** Streaming request timeout for long-running LLM responses. */
export const STREAM_REQUEST_TIMEOUT_MS = 300_000;

/** Timeout for MCP tools/list and health check requests. */
export const MCP_TOOLS_TIMEOUT_MS = 5_000;

/** Timeout for health-check / fetch operations in StatusService. */
export const HEALTH_CHECK_TIMEOUT_MS = 10_000;

/** Timeout for walking a response chain in ConversationService. */
export const RESPONSE_CHAIN_TIMEOUT_MS = 15_000;

/** Default HTTP timeout for fetchWithTlsControl. */
export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

/** Timeout for MCP connection test requests. */
export const MCP_CONNECTION_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Token / auth constants
// ---------------------------------------------------------------------------

/** Buffer (seconds) before token expiry to trigger a refresh. */
export const TOKEN_EXPIRY_BUFFER_S = 60;

/** Timeout for token fetch operations (ms). */
export const TOKEN_FETCH_TIMEOUT_MS = 60_000;

/** Timeout for token exchange operations (ms). */
export const TOKEN_EXCHANGE_TIMEOUT_MS = 30_000;

/** Minimum token lifetime (seconds) to consider caching. */
export const MIN_TOKEN_LIFETIME_S = 300;

// ---------------------------------------------------------------------------
// Input validation limits
// ---------------------------------------------------------------------------

/** Maximum length for description/query fields in admin routes. */
export const MAX_DESCRIPTION_LENGTH = 2_000;

/** Maximum length for system prompt configuration. */
export const MAX_SYSTEM_PROMPT_LENGTH = 50_000;

// ---------------------------------------------------------------------------
// Cache / registry size limits
// ---------------------------------------------------------------------------

/** Maximum entries in the conversation registry (LRU-style cap). */
export const MAX_CONVERSATION_REGISTRY_SIZE = 10_000;

/** Maximum entries in the MCP auth token cache. */
export const MAX_TOKEN_CACHE_SIZE = 1_000;

/** Maximum entries in the DocumentSyncService content hash cache. */
export const MAX_CONTENT_HASH_CACHE_SIZE = 10_000;

/** Default expiration for OAuth tokens (seconds) when no expiry is provided. */
export const DEFAULT_TOKEN_EXPIRATION_S = 3_600;

// ---------------------------------------------------------------------------
// Pagination / list limits
// ---------------------------------------------------------------------------

/** Default page size for vector store file listing. */
export const VECTOR_STORE_PAGE_SIZE = 100;

/** Maximum conversations to return from a listing query. */
export const MAX_CONVERSATIONS_LIMIT = 100;

/** Maximum session list limit. */
export const MAX_SESSION_LIST_LIMIT = 500;

/** Default session list limit for admin queries. */
export const DEFAULT_SESSION_LIST_LIMIT = 100;

/** Maximum characters in a session title. */
export const MAX_SESSION_TITLE_LENGTH = 200;

// ---------------------------------------------------------------------------
// Content length limits
// ---------------------------------------------------------------------------

/** Maximum length for a message preview (truncated for session title). */
export const MESSAGE_PREVIEW_MAX_LENGTH = 200;

/** Maximum length of a tool output item logged during approval. */
export const APPROVAL_OUTPUT_LOG_MAX_LENGTH = 500;

/** Maximum file size for document uploads (bytes). */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Config validation limits
// ---------------------------------------------------------------------------

/** Maximum length for config values in validation. */
export const MAX_CONFIG_VALUE_SIZE = 100_000;

/** Maximum length for a model identifier. */
export const MAX_MODEL_LENGTH = 200;

/** Maximum length for branding text fields. */
export const MAX_BRANDING_FIELD_LENGTH = 500;

/** Maximum number of items in branding array fields. */
export const MAX_BRANDING_ARRAY_LENGTH = 100;

// ---------------------------------------------------------------------------
// Config defaults
// ---------------------------------------------------------------------------

/** Default embedding dimension when not specified. */
export const DEFAULT_EMBEDDING_DIMENSION = 384;

/** Default vector store name when not specified in config. */
export const DEFAULT_VECTOR_STORE_NAME = 'agentic-chat-knowledge-base';

/** Default chunk size for document ingestion. */
export const DEFAULT_CHUNK_SIZE = 512;

/** Default chunk overlap for document ingestion. */
export const DEFAULT_CHUNK_OVERLAP = 50;

/** Maximum allowed chunk size (tokens) in vector store config validation. */
export const MAX_CHUNK_SIZE_TOKENS = 100_000;

/** Maximum allowed chunk overlap (tokens) in vector store config validation. */
export const MAX_CHUNK_OVERLAP_TOKENS = 50_000;

/** Maximum file search results in vector store config validation. */
export const MAX_FILE_SEARCH_RESULTS = 100;

/** Default limit for conversation listing. */
export const DEFAULT_CONVERSATIONS_LIMIT = 50;

/** Maximum RAG search results for RAG test endpoint. */
export const MAX_RAG_SEARCH_RESULTS = 20;

/** Cache TTL for RuntimeConfigResolver (ms). */
export const CONFIG_CACHE_TTL_MS = 5_000;
