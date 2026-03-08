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
  /**
   * Configuration for Agentic Chat plugin
   *
   * ## Security Modes
   *
   * Agentic Chat supports 3 security modes, configurable via `security.mode`:
   *
   * ### Mode 1: 'none' - No Access Control
   * - Anyone can access Agentic Chat
   * - MCP servers are called without authentication
   * - Use for development or trusted internal environments
   *
   * ### Mode 2: 'plugin-only' - Plugin Access Control (Default)
   * - Users must be in a Keycloak group to access Agentic Chat
   * - MCP servers are called without authentication (they use their own service accounts)
   * - Authorization enforced at Backstage layer via RBAC
   *
   * ### Mode 3: 'full' - Full Authentication (EXPERIMENTAL)
   * - Users must be in a Keycloak group to access Agentic Chat
   * - MCP servers receive OAuth tokens for authentication
   * - End-to-end authentication chain
   * - ⚠️ NOT FULLY TESTED - use plugin-only for production
   *
   * @example Mode 1: No access control
   * ```yaml
   * agenticChat:
   *   security:
   *     mode: 'none'
   * ```
   *
   * @example Mode 2: Plugin-only (recommended)
   * ```yaml
   * agenticChat:
   *   security:
   *     mode: 'plugin-only'
   * ```
   *
   * @example Mode 3: Full authentication
   * ```yaml
   * agenticChat:
   *   security:
   *     mode: 'full'
   *     mcpOAuth:
   *       tokenUrl: 'https://keycloak.example.com/realms/demo/protocol/openid-connect/token'
   *       clientId: 'agentic-chat-backend'
   *       clientSecret: ${MCP_OAUTH_CLIENT_SECRET}
   *       scopes:
   *         - openid
   * ```
   *
   * ## RBAC Configuration (for modes 2 and 3)
   *
   * Configure Backstage RBAC to map Keycloak groups to permissions:
   *
   * @example rbac-policy.csv
   * ```csv
   * g, group:default/agentic-chat-users, role:default/agentic-chat-user
   * p, role:default/agentic-chat-user, agenticChat.access, read, allow
   * ```
   */
  agenticChat?: {
    /**
     * Enable debug logging in browser console
     * Can also be toggled at runtime via: window.enableAgenticChatDebug()
     * @visibility frontend
     */
    debug?: boolean;

    /**
     * Security configuration - controls authentication and authorization
     * @visibility backend
     */
    security?: {
      /**
       * Security mode:
       * - 'none': No access control (anyone can use Agentic Chat)
       * - 'plugin-only': Keycloak group controls plugin access, MCP servers are open (default)
       * - 'full': Keycloak auth for both plugin access AND MCP server authentication
       * @visibility backend
       */
      mode?: 'none' | 'plugin-only' | 'full';

      /**
       * Custom message shown when access is denied
       * @visibility frontend
       */
      accessDeniedMessage?: string;

      /**
       * User entity refs that should have admin access.
       * Used as a fallback when the Backstage permission framework is disabled
       * (permission.enabled: false). When permissions ARE enabled (e.g., on RHDH),
       * admin access is determined by RBAC policy and this list is ignored.
       *
       * Entity refs follow the format: 'user:default/<username>'
       * The username is derived from the Keycloak email local part
       * (via the emailLocalPartMatchingUserEntityName sign-in resolver).
       *
       * @example
       * ```yaml
       * agenticChat:
       *   security:
       *     adminUsers:
       *       - 'user:default/admin'
       *       - 'user:default/platform-lead'
       * ```
       * @visibility backend
       */
      adminUsers?: string[];

      /**
       * OAuth configuration for MCP server authentication
       * Only used in 'full' mode - provides tokens for MCP server calls
       * @visibility backend
       */
      mcpOAuth?: {
        /**
         * OAuth token endpoint URL (e.g., Keycloak token endpoint)
         * @visibility backend
         */
        tokenUrl: string;

        /**
         * OAuth client ID (service account client)
         * @visibility backend
         */
        clientId: string;

        /**
         * OAuth client secret
         * @visibility secret
         */
        clientSecret: string;

        /**
         * OAuth scopes to request (default: ['openid'])
         * @visibility backend
         */
        scopes?: string[];
      };
    };
    /**
     * Llama Stack configuration for RAG and chat
     */
    llamaStack: {
      /**
       * Base URL for the Llama Stack server
       * @visibility frontend
       */
      baseUrl: string;

      /**
       * IDs of vector stores to use for RAG (searches all)
       * Takes precedence over vectorStoreId if both specified
       * @visibility backend
       */
      vectorStoreIds?: string[];

      /**
       * ID of the vector store to use for RAG (backward compatibility)
       * Use vectorStoreIds for multiple stores
       * @visibility backend
       */
      vectorStoreId?: string;

      /**
       * Name for auto-created vector store (if vectorStoreId not specified)
       * Default: 'techx-db'
       * @visibility backend
       */
      vectorStoreName?: string;

      /**
       * Model to use for chat completions
       * @visibility frontend
       */
      model: string;

      /**
       * Embedding model for vector store creation
       * Default: 'sentence-transformers/all-MiniLM-L6-v2'
       * @visibility backend
       */
      embeddingModel?: string;

      /**
       * Embedding dimension for vector store creation
       * Default: 384
       * @visibility backend
       */
      embeddingDimension?: number;

      /**
       * Optional API token for authentication
       * @visibility secret
       */
      token?: string;

      /**
       * Chunking strategy for file uploads
       * @visibility backend
       */
      chunkingStrategy?: 'auto' | 'static';

      /**
       * Max chunk size in tokens (for static chunking)
       * @visibility backend
       */
      maxChunkSizeTokens?: number;

      /**
       * Chunk overlap in tokens (for static chunking)
       * @visibility backend
       */
      chunkOverlapTokens?: number;

      /**
       * Skip TLS certificate verification (for self-signed certs)
       * Default: false (secure by default)
       * Set to true only for development with self-signed certificates
       * WARNING: Enabling this in production is a security risk
       * @visibility backend
       */
      skipTlsVerify?: boolean;

      /**
       * Enable verbose logging for streaming events
       * Default: false (minimal logging)
       * When enabled, logs details of every SSE event for debugging
       * This creates a lot of log output - use only for debugging
       * @visibility backend
       */
      verboseStreamLogging?: boolean;

      /**
       * Tool choice configuration - controls how the model selects tools
       * - 'auto': Model decides when to call tools (default)
       * - 'required': Model must call at least one tool
       * - 'none': Model cannot call any tools
       * - object with type: 'function' to force a specific function
       * - object with type: 'allowed_tools' to restrict available tools
       *
       * @example Force specific function
       * ```yaml
       * toolChoice:
       *   type: function
       *   name: search_catalog
       * ```
       *
       * @example Restrict to specific tools
       * ```yaml
       * toolChoice:
       *   type: allowed_tools
       *   mode: auto
       *   tools:
       *     - type: file_search
       *     - type: mcp
       *       server_label: openshift
       * ```
       * @visibility backend
       */
      toolChoice?:
        | 'auto'
        | 'required'
        | 'none'
        | {
            type: 'function';
            name: string;
          }
        | {
            type: 'allowed_tools';
            mode?: 'auto' | 'required';
            tools: Array<
              | { type: 'file_search' }
              | { type: 'web_search' }
              | { type: 'code_interpreter' }
              | { type: 'mcp'; server_label: string }
              | { type: 'function'; name: string }
            >;
          };

      /**
       * Whether to allow parallel tool calls
       * - true: Model can call multiple tools in a single turn (default)
       * - false: Model can only call one tool at a time (sequential)
       * @visibility backend
       */
      parallelToolCalls?: boolean;

      /**
       * Structured output format - forces model to return JSON matching schema
       * Uses Responses API text.format field
       *
       * @example
       * ```yaml
       * textFormat:
       *   type: json_schema
       *   json_schema:
       *     name: deployment_issues
       *     strict: true
       *     schema:
       *       type: object
       *       properties:
       *         issues:
       *           type: array
       *           items:
       *             type: object
       *             properties:
       *               severity:
       *                 type: string
       *                 enum: [critical, warning, info]
       *               description:
       *                 type: string
       *       required: [issues]
       *       additionalProperties: false
       * ```
       * @visibility backend
       */
      /**
       * Note: textFormat is configured via YAML but not validated by TypeScript schema
       * due to Backstage config loader limitations with complex nested objects.
       * See the example in the JSDoc above for proper YAML structure.
       */
      textFormat?: {
        type: 'json_schema';
        json_schema: {
          name: string;
          /** JSON Schema object - defined in YAML, not validated by TypeScript */
          schema: object;
          strict?: boolean;
        };
      };

      /**
       * Custom function definitions for the model to call
       * These are added as tools alongside file_search and MCP servers
       *
       * @example
       * ```yaml
       * functions:
       *   - name: search_catalog
       *     description: Search the Backstage catalog for entities
       *     parameters:
       *       type: object
       *       properties:
       *         kind:
       *           type: string
       *           enum: [Component, API, System, Group]
       *           description: Entity kind to search for
       *         query:
       *           type: string
       *           description: Search query
       *       required: [kind, query]
       *       additionalProperties: false
       *     strict: true
       * ```
       * @visibility backend
       */
      functions?: Array<{
        /** Function name */
        name: string;
        /** Description of when and how to use the function */
        description: string;
        /** JSON Schema for function parameters - defined in YAML */
        parameters: object;
        /** Enforce strict schema compliance (default: true) */
        strict?: boolean;
      }>;

      /**
       * Enable Zero Data Retention (ZDR) mode for enterprise compliance
       * When enabled:
       * - Responses are NOT stored on the server (store: false)
       * - Encrypted reasoning tokens are returned for stateless operation
       * - Conversation history features will be disabled
       *
       * Use this for organizations with strict data retention policies
       * Default: false
       * @visibility backend
       */
      zdrMode?: boolean;

      /**
       * Enable the built-in web_search tool
       * When enabled, the model can search the web for real-time information
       * Useful for questions about current events, latest documentation, etc.
       * Default: false
       * @visibility backend
       */
      enableWebSearch?: boolean;

      /**
       * Search mode for RAG file search
       * - 'auto': Let the model decide (default)
       * - 'keyword': BM25 keyword search only
       * - 'semantic': Embedding-based semantic search only
       * - 'hybrid': Combine keyword and semantic search
       * @visibility backend
       */
      searchMode?: 'auto' | 'keyword' | 'semantic' | 'hybrid';

      /**
       * Weight for BM25 keyword search in hybrid mode (0-1)
       * Only used when searchMode is 'hybrid'
       * Default: 0.5
       * @visibility backend
       */
      bm25Weight?: number;

      /**
       * Weight for semantic search in hybrid mode (0-1)
       * Only used when searchMode is 'hybrid'
       * Default: 0.5
       * @visibility backend
       */
      semanticWeight?: number;

      /**
       * Maximum number of results returned by file search
       * Default: 10
       * @visibility backend
       */
      fileSearchMaxResults?: number;

      /**
       * Minimum relevance score threshold for file search results (0-1)
       * Results below this score are filtered out
       * @visibility backend
       */
      fileSearchScoreThreshold?: number;

      /**
       * Enable the built-in code_interpreter tool
       * When enabled, the model can execute Python code for data analysis
       * Useful for analyzing data, generating charts, running calculations
       * Default: false
       * @visibility backend
       */
      enableCodeInterpreter?: boolean;
    };

    /**
     * Document sources for automatic ingestion
     * @visibility backend
     */
    documents?: {
      /**
       * Sync mode: 'full' syncs all (add new, remove deleted), 'append' only adds new
       * @visibility backend
       */
      syncMode?: 'full' | 'append';

      /**
       * How often to sync documents (cron expression or duration like '1h', '30m')
       * If not set, only syncs on startup
       * @visibility backend
       */
      syncSchedule?: string;

      /**
       * Document sources to ingest
       * @visibility backend
       */
      sources?: Array<
        | {
            /**
             * Local directory source
             */
            type: 'directory';
            /**
             * Path to the directory (relative to Backstage root or absolute)
             */
            path: string;
            /**
             * Glob patterns to match files (e.g., '**\/*.md')
             */
            patterns?: string[];
          }
        | {
            /**
             * URL source - fetch documents from URLs
             */
            type: 'url';
            /**
             * List of URLs to fetch documents from
             */
            urls: string[];
          }
        | {
            /**
             * GitHub repository source
             */
            type: 'github';
            /**
             * Repository in format 'owner/repo'
             */
            repo: string;
            /**
             * Branch to fetch from (default: main)
             */
            branch?: string;
            /**
             * Path within the repository (default: root)
             */
            path?: string;
            /**
             * Glob patterns to match files
             */
            patterns?: string[];
            /**
             * GitHub token for private repos
             * @visibility secret
             */
            token?: string;
          }
      >;
    };

    /**
     * System prompt for the AI assistant
     * @visibility backend
     */
    systemPrompt?: string;

    /**
     * Quick prompts for common queries
     */
    quickPrompts?: Array<{
      /**
       * Title of the quick prompt
       * @visibility frontend
       */
      title: string;

      /**
       * Description of what this prompt does
       * @visibility frontend
       */
      description: string;

      /**
       * The actual prompt text
       * @visibility frontend
       */
      prompt: string;

      /**
       * Category for grouping prompts
       * @visibility frontend
       */
      category: string;
    }>;

    /**
     * MCP server configurations
     * @visibility backend
     */
    mcpServers?: Array<{
      /**
       * Unique identifier for the server
       * @visibility backend
       */
      id: string;

      /**
       * Display name for the server
       * @visibility frontend
       */
      name: string;

      /**
       * Server type - only 'streamable-http' and 'sse' are supported
       * @visibility backend
       */
      type: 'streamable-http' | 'sse';

      /**
       * URL for the MCP server
       * @visibility backend
       */
      url: string;

      /**
       * OAuth configuration for dynamic token authentication
       * If configured, Agentic Chat will obtain tokens from the OAuth provider
       * and include them in requests to this MCP server
       *
       * Alternative: Use authRef to reference a shared config from mcpAuth
       * @visibility backend
       */
      oauth?: {
        /**
         * OAuth token endpoint URL
         * @visibility backend
         */
        tokenUrl: string;

        /**
         * OAuth client ID (service account)
         * @visibility backend
         */
        clientId: string;

        /**
         * OAuth client secret
         * @visibility secret
         */
        clientSecret: string;

        /**
         * OAuth scopes to request (default: ['openid'])
         * @visibility backend
         */
        scopes?: string[];
      };

      /**
       * Kubernetes ServiceAccount authentication
       * Reads the token from a ServiceAccount in the cluster
       *
       * Alternative: Use authRef to reference a shared config from mcpAuth
       *
       * @example
       * ```yaml
       * mcpServers:
       *   - id: openshift
       *     serviceAccount:
       *       name: mcp-client-sa
       *       namespace: backstage
       * ```
       * @visibility backend
       */
      serviceAccount?: {
        /**
         * ServiceAccount name in the cluster
         * @visibility backend
         */
        name: string;

        /**
         * Namespace of the ServiceAccount (default: current namespace or 'default')
         * @visibility backend
         */
        namespace?: string;
      };

      /**
       * Human-in-the-loop approval requirement
       * - 'always': All tools require user approval
       * - 'never': Tools execute automatically (default)
       * - object with always/never arrays for fine-grained control
       * @visibility backend
       */
      requireApproval?:
        | 'always'
        | 'never'
        | {
            always?: string[];
            never?: string[];
          };
    }>;

    /**
     * Branding configuration for enterprise customization
     * @visibility frontend
     */
    branding?: {
      /**
       * Application name displayed in the UI
       * Default: 'Agentic Chat'
       * @visibility frontend
       */
      appName?: string;

      /**
       * Tagline displayed below the app name
       * Default: 'Your AI-powered platform assistant'
       * @visibility frontend
       */
      tagline?: string;

      /**
       * Primary brand color (hex)
       * Default: '#9333ea' (purple)
       * @visibility frontend
       */
      primaryColor?: string;

      /**
       * Secondary brand color (hex)
       * Default: '#8b5cf6' (violet)
       * @visibility frontend
       */
      secondaryColor?: string;

      /**
       * Success state color (hex)
       * Default: '#10b981' (emerald)
       * @visibility frontend
       */
      successColor?: string;

      /**
       * Warning state color (hex)
       * Default: '#f59e0b' (amber)
       * @visibility frontend
       */
      warningColor?: string;

      /**
       * Error state color (hex)
       * Default: '#ef4444' (red)
       * @visibility frontend
       */
      errorColor?: string;

      /**
       * Info state color (hex)
       * Default: '#0ea5e9' (sky blue)
       * @visibility frontend
       */
      infoColor?: string;

      /**
       * Custom logo URL (relative or absolute)
       * @visibility frontend
       */
      logoUrl?: string;

      /**
       * Custom font family
       * @visibility frontend
       */
      fontFamily?: string;

      /**
       * Custom monospace font family (for code)
       * @visibility frontend
       */
      fontFamilyMono?: string;

      /**
       * Enable glassmorphism effects
       * Default: true
       * @visibility frontend
       */
      enableGlassEffect?: boolean;

      /**
       * Theme preset to use ('default', 'enterprise', etc.)
       * Presets provide cohesive design systems with pre-configured colors and effects.
       *
       * Available presets:
       * - 'default': Original purple/violet theme with medium glass effects
       * - 'enterprise': Professional navy/blue theme with subtle glass effects
       *
       * Default: 'default'
       * @visibility frontend
       */
      themePreset?: 'default' | 'enterprise' | string;

      /**
       * Glass effect intensity level
       * Controls the blur and transparency of glassmorphism effects.
       *
       * Options:
       * - 'subtle': Corporate/professional (blur: 12px, minimal transparency)
       * - 'medium': Balanced premium feel (blur: 20px, moderate transparency)
       * - 'strong': Consumer-app style (blur: 24px, higher transparency)
       *
       * This overrides the preset's default glass intensity.
       * @visibility frontend
       */
      glassIntensity?: 'subtle' | 'medium' | 'strong';

      /**
       * Advanced glass effect configuration
       * Fine-tune glassmorphism effects with custom values.
       * This overrides both preset and glassIntensity settings.
       * @visibility frontend
       */
      glassConfig?: {
        /** Backdrop blur in pixels (8-24px recommended) */
        blur?: number;
        /** Background opacity (0-1, typically 0.02-0.06) */
        backgroundOpacity?: number;
        /** Border opacity (0-1, typically 0.05-0.15) */
        borderOpacity?: number;
      };
    };

    /**
     * Safety configuration for content moderation (optional)
     * Uses Llama Stack safety shields for input/output validation
     * @visibility backend
     */
    safety?: {
      /**
       * Enable safety checks
       * Default: false
       * @visibility backend
       */
      enabled?: boolean;

      /**
       * Shield IDs to register with Llama Stack
       * @visibility backend
       */
      registerShields?: Array<{
        /**
         * Shield identifier
         */
        shieldId: string;
        /**
         * Provider ID (e.g., 'llama-guard', 'prompt-guard')
         */
        providerId: string;
        /**
         * Provider-specific shield ID
         */
        providerShieldId: string;
      }>;

      /**
       * Shield IDs to apply to user input
       * @visibility backend
       */
      inputShields?: string[];

      /**
       * Shield IDs to apply to AI output
       * @visibility backend
       */
      outputShields?: string[];

      /**
       * Behavior when a shield API call fails (network error, timeout, etc.)
       * - 'allow': Allow the message through on error (fail-open, less secure)
       * - 'block': Block the message on error (fail-closed, more secure, default)
       * @visibility backend
       */
      onError?: 'allow' | 'block';
    };

    /**
     * Response evaluation configuration (optional)
     * Uses Llama Stack Scoring API to assess response quality
     * @visibility backend
     */
    evaluation?: {
      /**
       * Enable response evaluation
       * Default: false
       * @visibility backend
       */
      enabled?: boolean;

      /**
       * Scoring function IDs to use for evaluation
       * Available functions depend on Llama Stack server configuration
       * Common: 'braintrust::answer-relevancy', 'braintrust::faithfulness'
       * @visibility backend
       */
      scoringFunctions?: string[];

      /**
       * Minimum acceptable score (0-1)
       * Scores below this threshold log warnings
       * Default: 0.7
       * @visibility backend
       */
      minScoreThreshold?: number;

      /**
       * Behavior when a scoring API call fails (network error, timeout, etc.)
       * - 'skip': Skip evaluation and return no result (default)
       * - 'fail': Return a failed evaluation result to flag the issue
       * @visibility backend
       */
      onError?: 'skip' | 'fail';
    };

    /**
     * AI provider type
     * Currently only 'llamastack' is supported
     * Default: 'llamastack'
     * @visibility backend
     */
    provider?: 'llamastack';

    /**
     * Shared OAuth configurations for MCP server authentication.
     * Servers reference these by `authRef` to avoid duplicating credentials.
     *
     * @example
     * ```yaml
     * mcpAuth:
     *   - serverId: openshift
     *     oauth:
     *       tokenUrl: https://keycloak.example.com/realms/demo/protocol/openid-connect/token
     *       clientId: mcp-client
     *       clientSecret: ${MCP_OAUTH_SECRET}
     * ```
     * @visibility backend
     */
    mcpAuth?: Array<{
      /** Server ID to match against mcpServers[].id or mcpServers[].authRef */
      serverId: string;
      /** OAuth configuration */
      oauth: {
        /** @visibility backend */
        tokenUrl: string;
        /** @visibility backend */
        clientId: string;
        /** @visibility secret */
        clientSecret: string;
        /** @visibility backend */
        scopes?: string[];
      };
    }>;

    /**
     * Swim lanes - grouped action cards for the welcome screen
     * @visibility frontend
     */
    swimLanes?: Array<{
      /**
       * Unique identifier
       */
      id: string;
      /**
       * Display title
       */
      title: string;
      /**
       * Description text
       */
      description?: string;
      /**
       * Icon name
       */
      icon?: string;
      /**
       * Lane color (hex)
       */
      color?: string;
      /**
       * Display order (lower numbers first)
       */
      order?: number;
      /**
       * Action cards in this lane
       */
      cards?: Array<{
        /**
         * Card title
         */
        title: string;
        /**
         * Card description
         */
        description?: string;
        /**
         * Prompt to send when clicked
         */
        prompt: string;
        /**
         * Icon name
         */
        icon?: string;
        /**
         * Mark as coming soon
         */
        comingSoon?: boolean;
        /**
         * Custom coming soon label
         */
        comingSoonLabel?: string;
      }>;
    }>;

    /**
     * Workflows - multi-step guided experiences
     * @visibility frontend
     */
    workflows?: Array<{
      /**
       * Unique identifier
       */
      id: string;
      /**
       * Workflow name
       */
      name: string;
      /**
       * Workflow description
       */
      description?: string;
      /**
       * Icon name
       */
      icon?: string;
      /**
       * Category: 'Deploy', 'Migrate', 'Daily'
       */
      category?: string;
      /**
       * Mark as coming soon
       */
      comingSoon?: boolean;
      /**
       * Workflow steps
       */
      steps?: Array<{
        /**
         * Step title
         */
        title: string;
        /**
         * Prompt for this step
         */
        prompt: string;
        /**
         * Step description
         */
        description?: string;
      }>;
    }>;
  };
}
