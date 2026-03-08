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
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { toErrorMessage } from '../../services/utils';
import {
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_EMBEDDING_DIMENSION,
  DEFAULT_VECTOR_STORE_NAME,
} from '../../constants';
import { loadBrandingOverrides as loadBrandingOverridesFromModule } from './BrandingConfigLoader';
import {
  loadMcpAuthConfigs as loadMcpAuthConfigsFromModule,
  loadMcpServerConfigs as loadMcpServerConfigsFromModule,
} from './McpConfigLoader';
import {
  AllowedToolSpec,
  LlamaStackConfig,
  ReasoningConfig,
  DocumentsConfig,
  DocumentSource,
  MCPAuthConfig,
  MCPServerConfig,
  SecurityConfig,
  SecurityMode,
  SecurityMcpOAuthConfig,
  Workflow,
  QuickAction,
  SwimLane,
} from '../../types';

/**
 * Configuration validation error
 * Thrown when required configuration is missing or invalid
 */
export class ConfigValidationError extends Error {
  constructor(message: string, public readonly configPath: string) {
    super(`Configuration error at '${configPath}': ${message}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Configuration loader for Agentic Chat
 *
 * Parses all configuration from app-config.yaml including:
 * - Llama Stack connection settings
 * - Document sources
 * - MCP server configurations
 * - Security settings
 * - Workflows and quick actions
 *
 * Configuration validation:
 * - Required fields are validated at load time with clear error messages
 * - Optional fields return sensible defaults
 * - All config loading errors are logged with context
 */
export class ConfigLoader {
  private readonly config: RootConfigService;
  private readonly logger: LoggerService;

  constructor(config: RootConfigService, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Validate that the minimum required configuration is present.
   * Call this during plugin initialization to fail fast with clear errors.
   * @throws ConfigValidationError if required config is missing
   */
  validateRequiredConfig(): void {
    const errors: string[] = [];

    // Check for agenticChat.llamaStack section
    if (!this.config.has('agenticChat.llamaStack')) {
      errors.push("Missing required config section 'agenticChat.llamaStack'");
    } else {
      // Check for required fields within llamaStack
      if (!this.config.has('agenticChat.llamaStack.baseUrl')) {
        errors.push("Missing required config 'agenticChat.llamaStack.baseUrl'");
      }
      if (!this.config.has('agenticChat.llamaStack.model')) {
        errors.push("Missing required config 'agenticChat.llamaStack.model'");
      }
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('; ');
      this.logger.error(
        `Agentic Chat configuration validation failed: ${errorMessage}`,
      );
      throw new ConfigValidationError(errorMessage, 'agenticChat');
    }

    this.logger.info('Agentic Chat configuration validated successfully');
  }

  /**
   * Load Llama Stack configuration from app-config
   * Supports both single vectorStoreId (backward compat) and vectorStoreIds array
   * If no vectorStoreId is configured, will auto-create using vectorStoreName
   */
  loadLlamaStackConfig(): LlamaStackConfig {
    const llamaStackConfig = this.config.getConfig('agenticChat.llamaStack');

    // Support both single vectorStoreId (backward compat) and vectorStoreIds array
    let vectorStoreIds: string[] = [];
    const vectorStoreIdsArray =
      llamaStackConfig.getOptionalStringArray('vectorStoreIds');
    if (vectorStoreIdsArray && vectorStoreIdsArray.length > 0) {
      vectorStoreIds = vectorStoreIdsArray;
    } else {
      // Backward compatibility: single vectorStoreId
      const singleId = llamaStackConfig.getOptionalString('vectorStoreId');
      if (singleId) {
        vectorStoreIds = [singleId];
      }
    }

    // vectorStoreIds can be empty - will auto-create during ensureVectorStoreExists()

    const toolChoice = this.parseToolChoiceConfig(llamaStackConfig);

    // vectorStoreName is the canonical identifier for the vector store.
    // Used as fallback when vectorStoreIds are not provided.
    // Defaults to 'agentic-chat-knowledge-base' if not configured.
    const vectorStoreName =
      llamaStackConfig.getOptionalString('vectorStoreName') ||
      DEFAULT_VECTOR_STORE_NAME;
    this.logger.info(`RAG vector store name: "${vectorStoreName}"`);

    const { searchMode, bm25Weight, semanticWeight } =
      this.parseHybridSearchConfig(llamaStackConfig);

    return {
      baseUrl: llamaStackConfig.getString('baseUrl'),
      vectorStoreIds,
      vectorStoreName, // Required - will throw if not configured
      embeddingModel:
        llamaStackConfig.getOptionalString('embeddingModel') ||
        'sentence-transformers/all-MiniLM-L6-v2',
      embeddingDimension:
        llamaStackConfig.getOptionalNumber('embeddingDimension') ||
        DEFAULT_EMBEDDING_DIMENSION,
      searchMode,
      bm25Weight,
      semanticWeight,
      model: llamaStackConfig.getString('model'),
      token: llamaStackConfig.getOptionalString('token'),
      chunkingStrategy:
        (llamaStackConfig.getOptionalString('chunkingStrategy') as
          | 'auto'
          | 'static') || 'auto',
      maxChunkSizeTokens:
        llamaStackConfig.getOptionalNumber('maxChunkSizeTokens') ||
        DEFAULT_CHUNK_SIZE,
      chunkOverlapTokens:
        llamaStackConfig.getOptionalNumber('chunkOverlapTokens') ||
        DEFAULT_CHUNK_OVERLAP,
      skipTlsVerify:
        llamaStackConfig.getOptionalBoolean('skipTlsVerify') ?? false, // Default false (secure by default)
      verboseStreamLogging:
        llamaStackConfig.getOptionalBoolean('verboseStreamLogging') ?? false, // Default false (minimal logging)
      toolChoice, // Pass through to Responses API
      parallelToolCalls:
        llamaStackConfig.getOptionalBoolean('parallelToolCalls'), // undefined = API default (true)
      textFormat: llamaStackConfig.getOptional('textFormat') as
        | LlamaStackConfig['textFormat']
        | undefined, // Structured output format
      functions: llamaStackConfig.getOptional('functions') as
        | LlamaStackConfig['functions']
        | undefined, // Custom function definitions
      zdrMode: llamaStackConfig.getOptionalBoolean('zdrMode') ?? false, // Zero Data Retention mode
      enableWebSearch:
        llamaStackConfig.getOptionalBoolean('enableWebSearch') ?? false,
      enableCodeInterpreter:
        llamaStackConfig.getOptionalBoolean('enableCodeInterpreter') ?? false,
      fileSearchMaxResults:
        llamaStackConfig.getOptionalNumber('fileSearchMaxResults') || undefined,
      fileSearchScoreThreshold:
        llamaStackConfig.getOptionalNumber('fileSearchScoreThreshold') ||
        undefined,
      reasoning: this.parseReasoningConfig(llamaStackConfig),
    };
  }

  /**
   * Load security configuration from app-config
   * Defaults to 'plugin-only' mode if not configured
   */
  loadSecurityConfig(): SecurityConfig {
    const securityMode =
      (this.config.getOptionalString(
        'agenticChat.security.mode',
      ) as SecurityMode) || 'plugin-only';

    const accessDeniedMessage = this.config.getOptionalString(
      'agenticChat.security.accessDeniedMessage',
    );

    // Load mcpOAuth for 'full' mode
    let mcpOAuth: SecurityMcpOAuthConfig | undefined;
    const mcpOAuthConfig = this.config.getOptionalConfig(
      'agenticChat.security.mcpOAuth',
    );
    if (mcpOAuthConfig) {
      mcpOAuth = {
        tokenUrl: mcpOAuthConfig.getString('tokenUrl'),
        clientId: mcpOAuthConfig.getString('clientId'),
        clientSecret: mcpOAuthConfig.getString('clientSecret'),
        scopes: mcpOAuthConfig.getOptionalStringArray('scopes') || ['openid'],
      };
    }

    // Validate configuration based on mode
    if (securityMode === 'full' && !mcpOAuth) {
      this.logger.warn(
        `Security mode 'full' requires mcpOAuth configuration. Falling back to 'plugin-only' mode.`,
      );
      return {
        mode: 'plugin-only',
        accessDeniedMessage,
      };
    }

    return {
      mode: securityMode,
      accessDeniedMessage,
      mcpOAuth,
    };
  }

  /**
   * Load documents configuration from app-config
   */
  loadDocumentsConfig(): DocumentsConfig | null {
    try {
      const documentsConfig = this.config.getOptionalConfig(
        'agenticChat.documents',
      );
      if (!documentsConfig) {
        return null;
      }

      const syncMode =
        (documentsConfig.getOptionalString('syncMode') as 'full' | 'append') ||
        'append';
      const syncSchedule = documentsConfig.getOptionalString('syncSchedule');

      const sourcesConfig = documentsConfig.getOptionalConfigArray('sources');
      if (!sourcesConfig || sourcesConfig.length === 0) {
        return null;
      }

      const sources = this.parseDocumentSources(sourcesConfig);

      return {
        syncMode,
        syncSchedule,
        sources,
      };
    } catch (error) {
      // Log the actual error for debugging, not just a generic message
      const errorMsg = toErrorMessage(error);
      this.logger.warn(
        `Failed to load documents configuration: ${errorMsg}. Document sync will be disabled.`,
      );
      return null;
    }
  }

  /**
   * Load named MCP auth configurations from app-config
   */
  loadMcpAuthConfigs(): Map<string, MCPAuthConfig> {
    return loadMcpAuthConfigsFromModule(this.config, this.logger);
  }

  /**
   * Load the proxy base URL used for MCP tool namespacing.
   * The proxy sits between LlamaStack and real MCP servers to prefix
   * tool names with the server ID, avoiding duplicate-name errors.
   *
   * Defaults to `${backend.baseUrl}/api/agentic-chat` when not explicitly set.
   */
  loadProxyBaseUrl(): string {
    const explicit = this.config.getOptionalString('agenticChat.proxyBaseUrl');
    if (explicit) return explicit.replace(/\/$/, '');

    const backendBase = this.config.getOptionalString('backend.baseUrl');
    if (backendBase)
      return `${backendBase.replace(/\/$/, '')}/api/agentic-chat`;

    return 'http://localhost:7007/api/agentic-chat';
  }

  /**
   * Load MCP server configurations from app-config
   */
  loadMcpServerConfigs(): MCPServerConfig[] {
    return loadMcpServerConfigsFromModule(
      this.config,
      this.logger,
      this.loadMcpAuthConfigs(),
    );
  }

  /**
   * Load workflows from app-config
   */
  loadWorkflows(): Workflow[] {
    try {
      const workflowsConfig = this.config.getOptionalConfigArray(
        'agenticChat.workflows',
      );
      if (!workflowsConfig || workflowsConfig.length === 0) {
        return [];
      }

      return workflowsConfig.map(wf => ({
        id: wf.getString('id'),
        name: wf.getString('name'),
        description: wf.getOptionalString('description') || '',
        icon: wf.getOptionalString('icon'),
        category: wf.getOptionalString('category'),
        comingSoon: wf.getOptionalBoolean('comingSoon'),
        comingSoonLabel: wf.getOptionalString('comingSoonLabel'),
        steps: (wf.getOptionalConfigArray('steps') || []).map(step => ({
          title: step.getString('title'),
          prompt: step.getString('prompt'),
          description: step.getOptionalString('description'),
        })),
      }));
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.warn(`Failed to load workflows: ${errorMsg}`);
      return [];
    }
  }

  /**
   * Load quick actions from app-config (maps from quickPrompts for compatibility)
   */
  loadQuickActions(): QuickAction[] {
    try {
      const quickPromptsConfig = this.config.getOptionalConfigArray(
        'agenticChat.quickPrompts',
      );
      if (!quickPromptsConfig || quickPromptsConfig.length === 0) {
        return [];
      }

      return quickPromptsConfig.map(qp => ({
        title: qp.getString('title'),
        description: qp.getOptionalString('description'),
        prompt: qp.getString('prompt'),
        icon: qp.getOptionalString('icon'),
        category: qp.getOptionalString('category'),
        comingSoon: qp.getOptionalBoolean('comingSoon'),
        comingSoonLabel: qp.getOptionalString('comingSoonLabel'),
      }));
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.warn(`Failed to load quick prompts: ${errorMsg}`);
      return [];
    }
  }

  /**
   * Load swim lanes from app-config (grouped actions for app developers)
   * Swim lanes are sorted by the optional 'order' field (lower numbers first).
   * If 'order' is not specified, the array index order from config is preserved.
   */
  loadSwimLanes(): SwimLane[] {
    try {
      const swimLanesConfig = this.config.getOptionalConfigArray(
        'agenticChat.swimLanes',
      );
      if (!swimLanesConfig || swimLanesConfig.length === 0) {
        return [];
      }

      const swimLanes = swimLanesConfig.map((sl, index) => {
        const cardsConfig = sl.getOptionalConfigArray('cards') || [];
        return {
          id: sl.getString('id'),
          title: sl.getString('title'),
          description: sl.getOptionalString('description'),
          icon: sl.getOptionalString('icon'),
          color: sl.getOptionalString('color'),
          // Use explicit order if provided, otherwise use array index (1-based for clarity)
          order: sl.getOptionalNumber('order') ?? index + 1,
          cards: cardsConfig.map(card => ({
            title: card.getString('title'),
            description: card.getOptionalString('description'),
            prompt: card.getString('prompt'),
            icon: card.getOptionalString('icon'),
            comingSoon: card.getOptionalBoolean('comingSoon'),
            comingSoonLabel: card.getOptionalString('comingSoonLabel'),
          })),
        };
      });

      // Sort by order (lower numbers appear first)
      return swimLanes.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.warn(`Failed to load swim lanes: ${errorMsg}`);
      return [];
    }
  }

  /**
   * Load system prompt from app-config
   */
  loadSystemPrompt(): string {
    const configuredPrompt = this.config.getOptionalString(
      'agenticChat.systemPrompt',
    );
    if (!configuredPrompt) {
      this.logger.warn(
        'No agenticChat.systemPrompt configured - model will use default behavior',
      );
    }
    return configuredPrompt || '';
  }

  /**
   * Load branding overrides from app-config.yaml (agenticChat.branding).
   * Returns only the fields explicitly set in YAML; consumers merge
   * with DEFAULT_BRANDING to get a complete BrandingConfig.
   */
  loadBrandingOverrides(): Record<string, unknown> {
    return loadBrandingOverridesFromModule(this.config, this.logger);
  }

  /**
   * Parse toolChoice config - can be string or object.
   * @internal
   */
  private parseToolChoiceConfig(
    config: Config,
  ): LlamaStackConfig['toolChoice'] {
    const toolChoiceConfig = config.getOptional('toolChoice');
    if (!toolChoiceConfig) {
      return undefined;
    }
    if (typeof toolChoiceConfig === 'string') {
      return toolChoiceConfig as 'auto' | 'required' | 'none';
    }
    if (typeof toolChoiceConfig === 'object' && toolChoiceConfig !== null) {
      const configObj = toolChoiceConfig as Record<string, unknown>;
      if (configObj.type === 'function' && typeof configObj.name === 'string') {
        return { type: 'function', name: configObj.name };
      }
      if (
        configObj.type === 'allowed_tools' &&
        Array.isArray(configObj.tools)
      ) {
        return {
          type: 'allowed_tools',
          mode: (configObj.mode as 'auto' | 'required') || 'auto',
          tools: configObj.tools as AllowedToolSpec[],
        };
      }
    }
    return undefined;
  }

  /**
   * Parse reasoning config from llamaStack config.
   * Supports both shorthand (effort-only string) and full object form.
   * @internal
   */
  private parseReasoningConfig(config: Config): ReasoningConfig | undefined {
    const raw = config.getOptional('reasoning');
    if (!raw) return undefined;

    if (typeof raw === 'string') {
      const effort = raw as ReasoningConfig['effort'];
      if (effort === 'low' || effort === 'medium' || effort === 'high') {
        return { effort };
      }
      this.logger.warn(`Invalid reasoning effort value: "${raw}", ignoring`);
      return undefined;
    }

    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const result: ReasoningConfig = {};

      const effort = obj.effort as string | undefined;
      if (effort === 'low' || effort === 'medium' || effort === 'high') {
        result.effort = effort;
      }

      const summary = obj.summary as string | undefined;
      if (
        summary === 'auto' ||
        summary === 'concise' ||
        summary === 'detailed' ||
        summary === 'none'
      ) {
        result.summary = summary;
      }

      if (Object.keys(result).length > 0) {
        this.logger.info(
          `Reasoning config: effort=${result.effort ?? 'default'}, summary=${
            result.summary ?? 'default'
          }`,
        );
        return result;
      }
    }

    return undefined;
  }

  /**
   * Parse hybrid search configuration from llamaStack config.
   * @internal
   */
  private parseHybridSearchConfig(config: Config): {
    searchMode: 'semantic' | 'keyword' | 'hybrid' | undefined;
    bm25Weight: number | undefined;
    semanticWeight: number | undefined;
  } {
    const searchMode = config.getOptionalString('searchMode') as
      | 'semantic'
      | 'keyword'
      | 'hybrid'
      | undefined;
    const bm25Weight = config.getOptionalNumber('bm25Weight');
    const semanticWeight = config.getOptionalNumber('semanticWeight');

    if (searchMode === 'hybrid') {
      this.logger.info(
        `Hybrid search enabled: bm25Weight=${
          bm25Weight ?? 0.5
        }, semanticWeight=${semanticWeight ?? 0.5}`,
      );
    }

    return { searchMode, bm25Weight, semanticWeight };
  }

  /**
   * Parse document sources from sources config array.
   * @internal
   */
  private parseDocumentSources(sourcesConfig: Config[]): DocumentSource[] {
    const sources: DocumentSource[] = [];

    for (const sourceConfig of sourcesConfig) {
      const type = sourceConfig.getString('type') as
        | 'directory'
        | 'url'
        | 'github';

      switch (type) {
        case 'directory':
          sources.push({
            type: 'directory',
            path: sourceConfig.getString('path'),
            patterns: sourceConfig.getOptionalStringArray('patterns'),
          });
          break;
        case 'url':
          sources.push({
            type: 'url',
            urls: sourceConfig.getStringArray('urls'),
            headers: sourceConfig.getOptional('headers') as
              | Record<string, string>
              | undefined,
          });
          break;
        case 'github':
          sources.push({
            type: 'github',
            repo: sourceConfig.getString('repo'),
            branch: sourceConfig.getOptionalString('branch'),
            path: sourceConfig.getOptionalString('path'),
            patterns: sourceConfig.getOptionalStringArray('patterns'),
            token: sourceConfig.getOptionalString('token'),
          });
          break;
        default:
          this.logger.warn(`Unknown document source type: ${type}`);
      }
    }

    return sources;
  }
}
