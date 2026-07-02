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
import { Entity } from '@backstage/catalog-model';

/**
 * A remote endpoint declared on an `mcp-server` API entity's `spec.remotes`.
 *
 * @public
 */
export interface McpServerRemote {
  type?: string;
  url: string;
}

/**
 * Selects the MCP remote to connect to for an entity: prefers a
 * `streamable-http` remote, falling back to the first declared remote.
 *
 * @public
 */
export function selectMcpServerRemote(
  entity: Entity,
): McpServerRemote | undefined {
  const remotes =
    ((entity.spec ?? {}) as { remotes?: McpServerRemote[] }).remotes ?? [];
  return remotes.find(r => r.type === 'streamable-http') ?? remotes[0];
}

/**
 * Whether a remote URL is a well-formed `http(s)` URL. Guards against SSRF via
 * non-http(s) schemes (e.g. `file:`, `gopher:`) and malformed URLs.
 *
 * @public
 */
export function isSupportedMcpRemoteUrl(url: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
