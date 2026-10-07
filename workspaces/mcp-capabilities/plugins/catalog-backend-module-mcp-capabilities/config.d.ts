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

export interface Config {
  mcpCapabilities?: {
    /**
     * Controls how the catalog enrichment processor persists discovered MCP
     * server data onto `mcp-server` API entities.
     */
    enrichment?: {
      /**
       * How long a server's discovery result is cached before re-fetching, in
       * minutes.
       *
       * @default 10
       */
      ttlMinutes?: number;

      /**
       * What to persist onto entities. `summary` writes capabilities, counts,
       * server identity and tool names; `names` writes only tool names and
       * counts (smaller entities, still searchable by tool name).
       *
       * @default 'summary'
       */
      fields?: 'names' | 'summary';
    };
  };
}
