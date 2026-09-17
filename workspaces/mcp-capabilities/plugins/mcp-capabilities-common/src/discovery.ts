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
import {
  MCPCapabilities,
  MCPPromptInfo,
  MCPResourceInfo,
  MCPServerSpec,
  MCPToolAnnotations,
  MCPToolInfo,
} from './types';

/**
 * Structural shapes of the raw items returned by an MCP server's list calls
 * (`tools/list`, `resources/list`, `prompts/list`). Declared here (rather than
 * importing `@modelcontextprotocol/sdk`) so this package stays free of the SDK
 * and safe for the frontend to consume.
 */
type RawTool = {
  name: string;
  description?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
  annotations?: unknown;
};
type RawResource = {
  uri: string;
  name: string;
  title?: unknown;
  description?: unknown;
  mimeType?: unknown;
  size?: unknown;
};
type RawPrompt = {
  name: string;
  title?: unknown;
  description?: unknown;
  arguments?: unknown;
};

function toMCPToolInfo(raw: RawTool): MCPToolInfo {
  return {
    name: raw.name,
    description: raw.description,
    inputSchema: (raw.inputSchema as JsonObject) ?? {},
    outputSchema: raw.outputSchema as JsonObject | undefined,
    annotations: raw.annotations as MCPToolAnnotations | undefined,
  };
}

function toMCPResourceInfo(raw: RawResource): MCPResourceInfo {
  return {
    uri: raw.uri,
    name: raw.name,
    title: raw.title as string | undefined,
    description: raw.description as string | undefined,
    mimeType: raw.mimeType as string | undefined,
    size: raw.size as number | undefined,
  };
}

function toMCPPromptInfo(raw: RawPrompt): MCPPromptInfo {
  return {
    name: raw.name,
    title: raw.title as string | undefined,
    description: raw.description as string | undefined,
    arguments: raw.arguments as MCPPromptInfo['arguments'],
  };
}

function capabilityFlags(
  raw: { tools?: unknown; resources?: unknown; prompts?: unknown } | undefined,
): Required<MCPCapabilities> {
  return {
    tools: Boolean(raw?.tools),
    resources: Boolean(raw?.resources),
    prompts: Boolean(raw?.prompts),
  };
}

/**
 * The subset of the MCP SDK `Client` that discovery relies on. Declared
 * structurally so this package does not depend on the SDK — callers pass a
 * connected `Client` (or a test double) that satisfies this shape.
 *
 * @public
 */
export interface McpDiscoveryClient {
  getServerVersion(): { name?: string; version?: string } | undefined;
  getInstructions(): string | undefined;
  getServerCapabilities():
    | { tools?: unknown; resources?: unknown; prompts?: unknown }
    | undefined;
  listTools(params?: unknown, options?: unknown): Promise<{ tools: unknown[] }>;
  listResources(
    params?: unknown,
    options?: unknown,
  ): Promise<{ resources: unknown[] }>;
  listPrompts(
    params?: unknown,
    options?: unknown,
  ): Promise<{ prompts: unknown[] }>;
}

async function safeList<T>(
  group: string,
  call: () => Promise<T[]>,
  onListError?: (message: string) => void,
): Promise<T[]> {
  try {
    return await call();
  } catch (error) {
    onListError?.(`${group} failed: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Discovers what an MCP server exposes from an already-connected client:
 * reads its identity and capabilities, then lists tools/resources/prompts —
 * but only those the server advertises, and with each list call isolated so a
 * failure in one leaves the others intact.
 *
 * The caller owns the client lifecycle (connect/close); this function neither
 * opens nor closes the connection.
 *
 * @public
 */
export async function discoverFromClient(
  client: McpDiscoveryClient,
  options: {
    requestOptions?: unknown;
    onListError?: (message: string) => void;
  } = {},
): Promise<MCPServerSpec> {
  const { requestOptions, onListError } = options;

  const serverVersion = client.getServerVersion();
  const serverInfo = serverVersion
    ? { name: serverVersion.name, version: serverVersion.version }
    : undefined;
  const instructions = client.getInstructions();
  const capabilities = capabilityFlags(client.getServerCapabilities());

  const tools = capabilities.tools
    ? await safeList(
        'tools/list',
        async () =>
          (
            await client.listTools(undefined, requestOptions)
          ).tools.map(t => toMCPToolInfo(t as RawTool)),
        onListError,
      )
    : [];
  const resources = capabilities.resources
    ? await safeList(
        'resources/list',
        async () =>
          (
            await client.listResources(undefined, requestOptions)
          ).resources.map(r => toMCPResourceInfo(r as RawResource)),
        onListError,
      )
    : [];
  const prompts = capabilities.prompts
    ? await safeList(
        'prompts/list',
        async () =>
          (
            await client.listPrompts(undefined, requestOptions)
          ).prompts.map(p => toMCPPromptInfo(p as RawPrompt)),
        onListError,
      )
    : [];

  return { serverInfo, capabilities, instructions, tools, resources, prompts };
}
