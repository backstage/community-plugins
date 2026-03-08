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
import type {
  LoggerService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import type {
  MCPServerConfig,
  DocumentsConfig,
  Workflow,
  QuickAction,
  SwimLane,
  SecurityConfig,
} from '../../types';
import type { ConfigLoader } from './ConfigLoader';
import type { ConfigResolutionService } from './ConfigResolutionService';
import type { ClientManager } from './ClientManager';
import { McpAuthService } from './McpAuthService';
import { McpProxyService } from './McpProxyService';
import { VectorStoreService } from './VectorStoreService';
import { DocumentSyncService } from './DocumentSyncService';
import {
  ConversationService,
  ConversationClientAccessor,
} from './ConversationService';
import type { VectorStoreFacade } from './VectorStoreFacade';
import type { ConversationFacade } from './ConversationFacade';
import { DocumentIngestionService } from '../../services/DocumentIngestionService';
import { RuntimeConfigResolver } from '../../services/RuntimeConfigResolver';
import type { AdminConfigService } from '../../services/AdminConfigService';

export interface OrchestratorInitDeps {
  configLoader: ConfigLoader;
  configResolution: ConfigResolutionService;
  clientManager: ClientManager;
  logger: LoggerService;
  database?: DatabaseService;
  adminConfig?: AdminConfigService;
  vectorStoreFacade: VectorStoreFacade;
  conversationFacade: ConversationFacade;
}

export interface OrchestratorState {
  securityConfig: SecurityConfig;
  ingestionService: DocumentIngestionService;
  mcpAuth: McpAuthService;
  mcpProxy: McpProxyService;
  proxyModeEnabled: boolean;
  yamlProxyBaseUrl: string;
  vectorStore: VectorStoreService;
  docSync: DocumentSyncService;
  documentsConfig: DocumentsConfig | null;
  conversations: ConversationService;
  mcpServers: MCPServerConfig[];
  workflows: Workflow[];
  quickActions: QuickAction[];
  swimLanes: SwimLane[];
}

/**
 * Runs all initialization steps in order and returns the assembled state.
 * The orchestrator calls this from initialize() and stores the result.
 *
 * Steps execute sequentially because later steps depend on earlier ones
 * (e.g. clientAndAuth must run before vectorStore/conversations).
 */
export async function initializeOrchestrator(
  deps: OrchestratorInitDeps,
): Promise<OrchestratorState> {
  const { configLoader, configResolution, clientManager, logger } = deps;

  configLoader.validateRequiredConfig();

  const securityConfig = configLoader.loadSecurityConfig();
  logger.info(`Agentic Chat security mode: ${securityConfig.mode}`);

  const llamaStackConfig = configLoader.loadLlamaStackConfig();
  configResolution.setLlamaStackConfig(llamaStackConfig);
  logger.info(
    `Agentic Chat configured with Llama Stack at ${llamaStackConfig.baseUrl}`,
  );

  const ingestionService = new DocumentIngestionService({
    logger,
    skipTlsVerify: llamaStackConfig.skipTlsVerify,
  });

  // Runtime config resolver (DB admin overrides)
  if (deps.adminConfig) {
    const resolver = new RuntimeConfigResolver({
      configLoader,
      adminConfig: deps.adminConfig,
      logger,
    });
    configResolution.setResolver(resolver);

    try {
      const initial = await resolver.resolve();
      configResolution.setLastResolvedModel(initial.model);
      configResolution.setLastResolvedVerboseLogging(
        initial.verboseStreamLogging,
      );
    } catch (error) {
      logger.debug(
        'Config resolution failed during model test, using last resolved model',
        error,
      );
      configResolution.setLastResolvedModel(llamaStackConfig.model);
      configResolution.setLastResolvedVerboseLogging(
        llamaStackConfig.verboseStreamLogging ?? false,
      );
    }
  }

  // Client & MCP auth
  const client = clientManager.getClient(llamaStackConfig);

  const mcpAuthConfigs = configLoader.loadMcpAuthConfigs();
  const mcpAuth = new McpAuthService(
    securityConfig,
    mcpAuthConfigs,
    logger,
    llamaStackConfig.skipTlsVerify,
  );
  if (mcpAuthConfigs.size > 0) {
    logger.info(
      `Agentic Chat loaded ${mcpAuthConfigs.size} named MCP auth config(s): ${[
        ...mcpAuthConfigs.keys(),
      ].join(', ')}`,
    );
  }

  const yamlProxyBaseUrl = configLoader.loadProxyBaseUrl();
  const mcpProxy = new McpProxyService({
    logger,
    mcpAuth,
    skipTlsVerify: llamaStackConfig.skipTlsVerify ?? false,
    proxyBaseUrl: yamlProxyBaseUrl,
  });
  logger.info(`MCP proxy base URL: ${yamlProxyBaseUrl} (proxy always enabled)`);

  // Vector store & documents
  const vectorStore = new VectorStoreService(client, llamaStackConfig, logger);

  const documentsConfig = configLoader.loadDocumentsConfig();
  if (documentsConfig && documentsConfig.sources.length > 0) {
    logger.info(
      `Agentic Chat loaded ${documentsConfig.sources.length} document source(s)`,
    );
  }

  const docSync = new DocumentSyncService(
    vectorStore,
    ingestionService,
    documentsConfig,
    logger,
    deps.database,
  );
  await docSync.initialize();
  deps.vectorStoreFacade.setServices(vectorStore, docSync);

  // Conversations
  const mcpServers = configLoader.loadMcpServerConfigs();
  if (mcpServers.length > 0) {
    logger.info(
      `Agentic Chat loaded ${mcpServers.length} MCP server(s): ${mcpServers
        .map(s => s.name)
        .join(', ')}`,
    );
  }

  const clientAccessor: ConversationClientAccessor = {
    getClient: () => clientManager.getExistingClient(),
    getModel: () =>
      configResolution.getLastResolvedModel() ?? llamaStackConfig.model,
  };
  const conversations = new ConversationService(
    clientAccessor,
    mcpAuth,
    mcpServers,
    logger,
    deps.database,
  );
  await conversations.initializeDatabase();
  conversations.setProxyMode(true, mcpProxy);
  deps.conversationFacade.setConversations(conversations);

  // Feature configs
  const workflows = configLoader.loadWorkflows();
  const quickActions = configLoader.loadQuickActions();
  const swimLanes = configLoader.loadSwimLanes();
  if (workflows.length > 0 || quickActions.length > 0 || swimLanes.length > 0) {
    logger.info(
      `Agentic Chat loaded ${workflows.length} workflow(s), ${quickActions.length} quick action(s), and ${swimLanes.length} swim lane(s)`,
    );
  }

  return {
    securityConfig,
    ingestionService,
    mcpAuth,
    mcpProxy,
    proxyModeEnabled: true,
    yamlProxyBaseUrl,
    vectorStore,
    docSync,
    documentsConfig,
    conversations,
    mcpServers,
    workflows,
    quickActions,
    swimLanes,
  };
}
