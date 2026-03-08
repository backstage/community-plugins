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
 * Strip the MCP proxy namespace prefix from a tool name.
 *
 * When the namespacing proxy is active, LlamaStack sees tool names like
 * `aap_mcp__projects_list` (prefix = `{serverId with dashes → underscores}__`).
 * This function removes that prefix for display to users.
 *
 * @param name - The potentially prefixed tool name
 * @param serverLabel - The MCP server label (e.g. `aap-mcp`)
 * @returns The clean tool name without the proxy prefix
 */
export function stripToolPrefix(name: string, serverLabel?: string): string {
  if (!serverLabel) return name;
  const prefix = `${serverLabel.replace(/-/g, '_')}__`;
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}
