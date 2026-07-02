/*
 * Copyright 2026 The Backstage Authors
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

import { JsonObject } from '@backstage/types';

/**
 * MCP tool behavioural hints, as defined by the Model Context Protocol.
 *
 * @public
 */
export interface MCPToolAnnotations {
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
  readOnlyHint?: boolean;
  title?: string;
  [key: string]: unknown;
}

/**
 * A single tool exposed by an MCP server.
 *
 * @public
 */
export interface MCPToolInfo {
  name: string;
  description?: string;
  inputSchema: JsonObject;
  outputSchema?: JsonObject;
  annotations?: MCPToolAnnotations;
}

/**
 * A resource exposed by an MCP server.
 *
 * @public
 */
export interface MCPResourceInfo {
  uri: string;
  name: string;
  title?: string;
  description?: string;
  mimeType?: string;
  size?: number;
}

/**
 * A prompt exposed by an MCP server.
 *
 * @public
 */
export interface MCPPromptInfo {
  name: string;
  title?: string;
  description?: string;
  arguments?: Array<{ name: string; description?: string; required?: boolean }>;
}

/**
 * Server identity reported during the MCP `initialize` handshake.
 *
 * @public
 */
export interface MCPServerInfo {
  name?: string;
  version?: string;
}

/**
 * Which MCP feature groups a server advertises.
 *
 * @public
 */
export interface MCPCapabilities {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
}

/**
 * The full live discovery result for one MCP server endpoint.
 *
 * @public
 */
export interface MCPServerSpec {
  serverInfo?: MCPServerInfo;
  protocolVersion?: string;
  capabilities?: MCPCapabilities;
  instructions?: string;
  tools: MCPToolInfo[];
  resources: MCPResourceInfo[];
  prompts: MCPPromptInfo[];
}

/**
 * The additive fields merged onto the native `API` / `spec.type: 'mcp-server'`
 * entity spec by the enrichment model layer. All optional — native entities
 * without them remain valid.
 *
 * @public
 */
export interface MCPServerEnrichmentSpec {
  capabilities?: MCPCapabilities;
  serverInfo?: MCPServerInfo;
  instructions?: string;
  toolCount?: number;
  resourceCount?: number;
  promptCount?: number;
  /** Flat list of discovered tool names, for catalog search. */
  toolNames?: string[];
}
