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

export interface Config {
  /** Configuration options for the MCP Chat Client plugin */
  mcpChat?: {
    /**
     * AI/LLM providers configuration
     * @visibility backend
     */
    providers: Array<{
      /**
       * Unique identifier for the provider
       * @visibility backend
       */
      id: string;
      /**
       * API token for the provider
       * @visibility secret
       */
      token?: string;
      /**
       * Model name to use for this provider
       * @visibility backend
       */
      model: string;
      /**
       * Base URL for the provider's API
       * @visibility backend
       */
      baseUrl?: string;
    }>;
    /**
     * MCP (Model Context Protocol) servers configuration
     * @visibility backend
     */
    mcpServers: Array<{
      /**
       * Unique identifier for the MCP server
       * @visibility backend
       */
      id: string;
      /**
       * Display name for the MCP server
       * @visibility backend
       */
      name: string;
      /**
       * NPX command to run the MCP server (for npm packages)
       * @visibility backend
       */
      npxCommand?: string;
      /**
       * URL endpoint for the MCP server (for HTTP-based servers)
       * @visibility backend
       */
      url?: string;
      /**
       * HTTP headers to include when connecting to the MCP server
       * @visibility backend
       */
      headers?: { [key: string]: string };
    }>;
  };
}
