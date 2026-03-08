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
  DatabaseService,
} from '@backstage/backend-plugin-api';
import {
  ChatRequest,
  ChatResponse,
  AgenticChatStatus,
  MCPServerConfig,
  Workflow,
  QuickAction,
  SwimLane,
  SecurityConfig,
} from '../../types';

import { ConfigLoader } from './ConfigLoader';
import { ClientManager } from './ClientManager';
import { ConfigResolutionService } from './ConfigResolutionService';
import { ChatService, ChatDeps } from './ChatService';
import { StatusService } from './StatusService';
import { aggregateStatus } from './StatusAggregator';
import { McpProxyService } from './McpProxyService';
import { McpToolsCacheManager } from './McpToolsCacheManager';
import { McpAuthService } from './McpAuthService';
import type { ConversationService } from './ConversationService';
import {
  VectorStoreFacade,
  VectorStoreFacadeContext,
} from './VectorStoreFacade';
import {
  ConversationFacade,
  ConversationFacadeContext,
} from './ConversationFacade';
import { initializeOrchestrator } from './OrchestratorInitializer';
import type { RuntimeConfigResolver } from '../../services/RuntimeConfigResolver';
import type { AdminConfigService } from '../../services/AdminConfigService';
import { toErrorMessage } from '../../services/utils';

/**
 * Llama Stack Orchestrator
 *
 * Orchestrates all Llama Stack sub-services to provide RAG-powered chat
 * using the Responses API with built-in file_search for vector store retrieval.
 *
 * Sub-services:
 * - LlamaStackClient: HTTP communication with Llama Stack
 * - ConfigLoader: Parse Llama Stack configuration from app-config.yaml
 * - McpAuthService: OAuth and ServiceAccount authentication for MCP servers
 * - VectorStoreService: Vector store operations (create, upload, list, delete)
 * - DocumentSyncService: Document synchronization from sources
 * - ConversationService: Conversation history and HITL handling
 *
 * NOTE: System prompt is fully configurable via agenticChat.systemPrompt in app-config.yaml
 * No hardcoded fallback - if not configured, the model will use its default behavior.
 */
export class LlamaStackOrchestrator {
  private readonly logger: LoggerService;
  private readonly database?: DatabaseService;
  private readonly adminConfig?: AdminConfigService;

  private configLoader: ConfigLoader;
  private chatService: ChatService;
  private statusService: StatusService;
  private clientManager: ClientManager;
  private readonly configResolution: ConfigResolutionService;
  private mcpAuth: McpAuthService | null = null;
  private conversations: ConversationService | null = null;

  private readonly vectorStoreFacade: VectorStoreFacade;
  private readonly conversationFacade: ConversationFacade;

  private mcpServers: MCPServerConfig[] = [];
  private workflows: Workflow[] = [];
  private quickActions: QuickAction[] = [];
  private swimLanes: SwimLane[] = [];
  private securityConfig: SecurityConfig = { mode: 'plugin-only' };

  private readonly mcpToolsCacheManager: McpToolsCacheManager;
  private mcpProxy: McpProxyService | null = null;
  private proxyModeEnabled = false;
  private yamlProxyBaseUrl: string = '';

  private initialized = false;
  private vectorStoreReady = false;

  constructor(options: {
    logger: LoggerService;
    config: RootConfigService;
    database?: DatabaseService;
    adminConfig?: AdminConfigService;
  }) {
    this.logger = options.logger;
    this.database = options.database;
    this.adminConfig = options.adminConfig;

    this.mcpToolsCacheManager = new McpToolsCacheManager(options.logger);
    this.configLoader = new ConfigLoader(options.config, options.logger);
    this.clientManager = new ClientManager(options.logger);
    this.chatService = new ChatService(options.logger);
    this.statusService = new StatusService();

    this.configResolution = new ConfigResolutionService(this.clientManager);
    this.configResolution.setSystemPrompt(this.configLoader.loadSystemPrompt());

    const vectorStoreContext: VectorStoreFacadeContext = {
      ensureInitialized: () => this.ensureInitialized(),
      configResolution: this.configResolution,
      getVectorStoreReady: () => this.vectorStoreReady,
      setVectorStoreReady: ready => {
        this.vectorStoreReady = ready;
      },
      getInitialized: () => this.initialized,
    };
    this.vectorStoreFacade = new VectorStoreFacade({
      vectorStore: null,
      docSync: null,
      logger: options.logger,
      context: vectorStoreContext,
    });

    const conversationContext: ConversationFacadeContext = {
      ensureInitialized: () => this.ensureInitialized(),
    };
    this.conversationFacade = new ConversationFacade({
      conversations: null,
      context: conversationContext,
    });
  }

  /**
   * Expose ClientManager so peer services (SafetyService, EvaluationService)
   * can obtain the current LlamaStackClient without duplicating HTTP code.
   */
  getClientManager(): ClientManager {
    return this.clientManager;
  }

  /**
   * Expose the RuntimeConfigResolver so the provider layer can
   * push dynamic overrides to safety/evaluation services per-request.
   */
  getResolver(): RuntimeConfigResolver | null {
    return this.configResolution.getResolver();
  }

  /**
   * Expose the VectorStoreFacade so callers (LlamaStackProvider) can
   * invoke document / vector-store operations directly.
   */
  getVectorStoreFacade(): VectorStoreFacade {
    return this.vectorStoreFacade;
  }

  /**
   * Expose the ConversationFacade so callers (LlamaStackProvider) can
   * invoke conversation operations directly.
   */
  getConversationFacade(): ConversationFacade {
    return this.conversationFacade;
  }

  /**
   * Initialize the service by loading config and testing connection.
   * Delegates all wiring to initializeOrchestrator() and stores the result.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const state = await initializeOrchestrator({
        configLoader: this.configLoader,
        configResolution: this.configResolution,
        clientManager: this.clientManager,
        logger: this.logger,
        database: this.database,
        adminConfig: this.adminConfig,
        vectorStoreFacade: this.vectorStoreFacade,
        conversationFacade: this.conversationFacade,
      });

      this.securityConfig = state.securityConfig;
      this.mcpAuth = state.mcpAuth;
      this.mcpProxy = state.mcpProxy;
      this.proxyModeEnabled = state.proxyModeEnabled;
      this.yamlProxyBaseUrl = state.yamlProxyBaseUrl;
      this.conversations = state.conversations;
      this.mcpServers = state.mcpServers;
      this.workflows = state.workflows;
      this.quickActions = state.quickActions;
      this.swimLanes = state.swimLanes;

      this.initialized = true;
      this.logger.info(
        'Agentic Chat service initialization complete ' +
          '(vector store and document sync deferred to first use)',
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize Agentic Chat: ${toErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * Ensures the service is initialized before use
   * @throws Error if the service has not been initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'LlamaStackOrchestrator not initialized. Call initialize() first.',
      );
    }
  }

  /**
   * Post-initialization hook.
   *
   * Warms caches so the first user request is fast:
   * - Resolves config (populates RuntimeConfigResolver cache)
   * - Runs a status check (populates MCP tools cache and detects proxy conflicts)
   *
   * Uses Promise.allSettled so individual failures do not block startup.
   * Vector store creation and document sync are still deferred to first use.
   */
  async postInitialize(): Promise<void> {
    const warmupTasks: Array<{ name: string; task: Promise<unknown> }> = [];

    warmupTasks.push({
      name: 'config',
      task: this.configResolution.resolve(),
    });

    if (this.mcpServers.length > 0 && this.mcpProxy) {
      warmupTasks.push({
        name: 'mcp-status-warmup',
        task: this.getStatus(),
      });
    }

    const results = await Promise.allSettled(warmupTasks.map(w => w.task));

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        this.logger.warn(
          `Warmup task "${
            warmupTasks[i].name
          }" failed (non-fatal): ${toErrorMessage(result.reason)}`,
        );
      }
    }

    this.logger.info('Post-initialization warmup complete');
  }

  // =============================================================================
  // Security Configuration
  // =============================================================================

  /**
   * Get the current security configuration
   * Used by router to determine access control behavior
   */
  getSecurityConfig(): SecurityConfig {
    return this.securityConfig;
  }

  // =============================================================================
  // Chat Methods - Delegated to ChatService
  // =============================================================================

  /**
   * Build the ChatDeps snapshot from current orchestrator state.
   * Uses resolveConfig() to get effective YAML + DB merged config.
   *
   * Proxy mode is always enabled for MCP tools. The proxy base URL
   * uses the admin DB override if set, otherwise falls back to the
   * YAML value cached at initialization.
   */
  private async buildChatDeps(): Promise<ChatDeps> {
    this.ensureInitialized();
    const config = await this.configResolution.resolve();

    const effectiveMcpServers = this.configResolution.getResolver()
      ? config.mcpServers ?? this.mcpServers
      : this.mcpServers;

    this.mcpProxy?.updateServers(effectiveMcpServers);

    if (this.mcpProxy) {
      this.mcpProxy.updateProxyBaseUrl(
        config.mcpProxyUrl ?? this.yamlProxyBaseUrl,
      );
    }

    return {
      client: this.clientManager.getExistingClient(),
      config,
      mcpServers: effectiveMcpServers,
      mcpAuth: this.mcpAuth,
      conversations: this.conversations,
      mcpProxy: this.mcpProxy ?? undefined,
      proxyModeEnabled: this.proxyModeEnabled,
    };
  }

  /**
   * Invalidate the runtime config cache so the next request
   * picks up freshly-saved admin overrides immediately.
   */
  invalidateRuntimeConfig(): void {
    this.configResolution.invalidateCache();
  }

  /**
   * Send a chat message with optional RAG (file_search) and MCP tools.
   * Delegates to ChatService with a per-request config snapshot.
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.chatService.chat(request, await this.buildChatDeps());
  }

  /**
   * Stream a chat message with real-time events.
   * Delegates to ChatService with a per-request config snapshot.
   */
  async chatStream(
    request: ChatRequest,
    onEvent: (event: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.chatService.chatStream(
      request,
      onEvent,
      await this.buildChatDeps(),
      signal,
    );
  }

  // =============================================================================
  // Workflow and Quick Action Methods
  // =============================================================================

  /**
   * Get all configured workflows
   */
  getWorkflows(): Workflow[] {
    return this.workflows;
  }

  /**
   * Get all configured quick actions
   */
  getQuickActions(): QuickAction[] {
    return this.quickActions;
  }

  /**
   * Get all configured swim lanes
   */
  getSwimLanes(): SwimLane[] {
    return this.swimLanes;
  }

  /**
   * Check if verbose stream logging is enabled
   */
  isVerboseStreamLoggingEnabled(): boolean {
    return this.configResolution.isVerboseStreamLoggingEnabled();
  }

  // =============================================================================
  // Status Methods — Delegated to StatusService
  // =============================================================================

  async getStatus(): Promise<AgenticChatStatus> {
    const llamaStackConfig = this.configResolution.getLlamaStackConfig();
    if (!llamaStackConfig) {
      return aggregateStatus({
        llamaStackConfig: null,
        clientManager: this.clientManager,
        mcpAuth: this.mcpAuth,
        mcpServers: this.mcpServers,
        yamlMcpServers: this.mcpServers,
        securityConfig: this.securityConfig,
        vectorStoreReady: this.vectorStoreReady,
        statusService: this.statusService,
        logger: this.logger,
      });
    }

    let resolved;
    try {
      this.ensureInitialized();
      resolved = await this.configResolution.resolve();
    } catch (error) {
      this.logger.debug(
        'Config resolution failed, using YAML fallback config',
        error,
      );
      resolved = this.configResolution.buildYamlFallback();
    }

    const status = await aggregateStatus({
      llamaStackConfig,
      resolved,
      clientManager: this.clientManager,
      mcpAuth: this.mcpAuth,
      mcpServers: resolved.mcpServers ?? this.mcpServers,
      yamlMcpServers: this.mcpServers,
      securityConfig: this.securityConfig,
      vectorStoreReady: this.vectorStoreReady,
      statusService: this.statusService,
      logger: this.logger,
    });

    this.mcpToolsCacheManager.updateFromStatus(
      status,
      this.proxyModeEnabled,
      this.mcpProxy,
      this.conversations,
    );
    return status;
  }

  /**
   * Handle an incoming MCP proxy request from LlamaStack.
   * Delegates to McpProxyService which prefixes/strips tool names.
   */
  async handleMcpProxyRequest(
    serverId: string,
    body: string,
    headers: Record<string, string>,
  ): Promise<{
    status: number;
    body: string;
    headers: Record<string, string>;
  }> {
    if (!this.mcpProxy) {
      return {
        status: 503,
        body: JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'MCP proxy not initialized' },
          id: null,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    return this.mcpProxy.handleRequest(serverId, body, headers);
  }

  /**
   * Handle a DELETE request for MCP session close.
   * Forwards the DELETE to the upstream and cleans proxy sessions.
   */
  async handleMcpProxyDelete(
    serverId: string,
    headers: Record<string, string>,
  ): Promise<{ status: number }> {
    if (!this.mcpProxy) {
      return { status: 200 };
    }
    return this.mcpProxy.handleDelete(serverId, headers);
  }
}
