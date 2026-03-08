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

import type { ConfigLoader } from './ConfigLoader';
import type { ConfigResolutionService } from './ConfigResolutionService';
import type { ClientManager } from './ClientManager';
import type { VectorStoreFacade } from './VectorStoreFacade';
import type { ConversationFacade } from './ConversationFacade';
import type { AdminConfigService } from '../../services/AdminConfigService';
import type { LlamaStackConfig } from '../../types';
import { createMockLogger } from '../../test-utils';
import {
  initializeOrchestrator,
  OrchestratorInitDeps,
} from './OrchestratorInitializer';

const mockResolverResolve = jest.fn();
const mockDocSyncInitialize = jest.fn();

jest.mock('../../services/RuntimeConfigResolver', () => ({
  RuntimeConfigResolver: jest.fn().mockImplementation(() => ({
    resolve: mockResolverResolve,
    invalidateCache: jest.fn(),
  })),
}));

jest.mock('./DocumentSyncService', () => ({
  DocumentSyncService: jest.fn().mockImplementation(() => ({
    initialize: mockDocSyncInitialize,
  })),
}));

const DEFAULT_LLAMA_STACK_CONFIG: LlamaStackConfig = {
  baseUrl: 'http://localhost:8321',
  model: 'test-model',
  vectorStoreIds: ['vs-1'],
  vectorStoreName: 'test-store',
  embeddingModel: 'test-embed',
  embeddingDimension: 384,
  chunkingStrategy: 'auto',
  maxChunkSizeTokens: 512,
  chunkOverlapTokens: 50,
};

function createMockConfigLoader(
  overrides?: Partial<{
    validateRequiredConfig: jest.Mock;
    loadSecurityConfig: jest.Mock;
    loadLlamaStackConfig: jest.Mock;
    loadMcpAuthConfigs: jest.Mock;
    loadProxyBaseUrl: jest.Mock;
    loadDocumentsConfig: jest.Mock;
    loadMcpServerConfigs: jest.Mock;
    loadWorkflows: jest.Mock;
    loadQuickActions: jest.Mock;
    loadSwimLanes: jest.Mock;
  }>,
): jest.Mocked<ConfigLoader> {
  return {
    validateRequiredConfig: jest.fn(),
    loadSecurityConfig: jest
      .fn()
      .mockReturnValue({ mode: 'plugin-only' as const }),
    loadLlamaStackConfig: jest.fn().mockReturnValue(DEFAULT_LLAMA_STACK_CONFIG),
    loadMcpAuthConfigs: jest.fn().mockReturnValue(new Map()),
    loadProxyBaseUrl: jest.fn().mockReturnValue('http://proxy.example.com'),
    loadDocumentsConfig: jest.fn().mockReturnValue(null),
    loadMcpServerConfigs: jest.fn().mockReturnValue([]),
    loadWorkflows: jest.fn().mockReturnValue([]),
    loadQuickActions: jest.fn().mockReturnValue([]),
    loadSwimLanes: jest.fn().mockReturnValue([]),
    ...overrides,
  } as unknown as jest.Mocked<ConfigLoader>;
}

function createMockConfigResolution(): jest.Mocked<ConfigResolutionService> {
  return {
    setLlamaStackConfig: jest.fn(),
    setResolver: jest.fn(),
    setLastResolvedModel: jest.fn(),
    setLastResolvedVerboseLogging: jest.fn(),
    getLastResolvedModel: jest.fn().mockReturnValue('test-model'),
  } as unknown as jest.Mocked<ConfigResolutionService>;
}

function createMockClientManager(): jest.Mocked<ClientManager> {
  const mockClient = {
    request: jest.fn(),
    getConfig: jest.fn().mockReturnValue(DEFAULT_LLAMA_STACK_CONFIG),
  };
  return {
    getClient: jest.fn().mockReturnValue(mockClient),
    getExistingClient: jest.fn().mockReturnValue(mockClient),
  } as unknown as jest.Mocked<ClientManager>;
}

function createMockVectorStoreFacade(): jest.Mocked<VectorStoreFacade> {
  return {
    setServices: jest.fn(),
  } as unknown as jest.Mocked<VectorStoreFacade>;
}

function createMockConversationFacade(): jest.Mocked<ConversationFacade> {
  return {
    setConversations: jest.fn(),
  } as unknown as jest.Mocked<ConversationFacade>;
}

function createBaseDeps(): OrchestratorInitDeps {
  const logger = createMockLogger();
  const clientManager = createMockClientManager();
  const configResolution = createMockConfigResolution();
  return {
    configLoader: createMockConfigLoader(),
    configResolution,
    clientManager,
    logger,
    vectorStoreFacade: createMockVectorStoreFacade(),
    conversationFacade: createMockConversationFacade(),
  };
}

describe('initializeOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocSyncInitialize.mockResolvedValue(undefined);
    mockResolverResolve.mockResolvedValue({
      model: 'test-model',
      verboseStreamLogging: false,
    });
  });

  describe('successful initialization', () => {
    it('creates all services, loads config, and sets up facades', async () => {
      const deps = createBaseDeps();

      const result = await initializeOrchestrator(deps);

      expect(deps.configLoader.validateRequiredConfig).toHaveBeenCalledTimes(1);
      expect(deps.configLoader.loadSecurityConfig).toHaveBeenCalledTimes(1);
      expect(deps.configLoader.loadLlamaStackConfig).toHaveBeenCalledTimes(1);
      expect(deps.configResolution.setLlamaStackConfig).toHaveBeenCalledWith(
        DEFAULT_LLAMA_STACK_CONFIG,
      );

      expect(result.securityConfig).toEqual({ mode: 'plugin-only' });
      expect(result.ingestionService).toBeDefined();
      expect(result.mcpAuth).toBeDefined();
      expect(result.mcpProxy).toBeDefined();
      expect(result.proxyModeEnabled).toBe(true);
      expect(result.yamlProxyBaseUrl).toBe('http://proxy.example.com');
      expect(result.vectorStore).toBeDefined();
      expect(result.docSync).toBeDefined();
      expect(result.documentsConfig).toBeNull();
      expect(result.conversations).toBeDefined();
      expect(result.mcpServers).toEqual([]);
      expect(result.workflows).toEqual([]);
      expect(result.quickActions).toEqual([]);
      expect(result.swimLanes).toEqual([]);

      expect(deps.vectorStoreFacade.setServices).toHaveBeenCalledWith(
        result.vectorStore,
        result.docSync,
      );
      expect(deps.conversationFacade.setConversations).toHaveBeenCalledWith(
        result.conversations,
      );
    });

    it('loads documents config when sources are configured', async () => {
      const docsConfig = {
        sources: [{ type: 'url' as const, url: 'https://example.com' }],
      };
      const deps = createBaseDeps();
      deps.configLoader.loadDocumentsConfig = jest
        .fn()
        .mockReturnValue(docsConfig);

      const result = await initializeOrchestrator(deps);

      expect(result.documentsConfig).toEqual(docsConfig);
    });

    it('loads MCP servers, workflows, quick actions, and swim lanes', async () => {
      const mcpServers = [
        { id: 'mcp-1', name: 'Test MCP', type: 'stdio', url: 'cmd://test' },
      ];
      const workflows = [{ id: 'wf-1', name: 'Test Workflow', steps: [] }];
      const quickActions = [{ id: 'qa-1', label: 'Quick', prompt: 'Do it' }];
      const swimLanes = [{ id: 'sl-1', title: 'Lane', cards: [] }];

      const deps = createBaseDeps();
      deps.configLoader.loadMcpServerConfigs = jest
        .fn()
        .mockReturnValue(mcpServers);
      deps.configLoader.loadWorkflows = jest.fn().mockReturnValue(workflows);
      deps.configLoader.loadQuickActions = jest
        .fn()
        .mockReturnValue(quickActions);
      deps.configLoader.loadSwimLanes = jest.fn().mockReturnValue(swimLanes);

      const result = await initializeOrchestrator(deps);

      expect(result.mcpServers).toEqual(mcpServers);
      expect(result.workflows).toEqual(workflows);
      expect(result.quickActions).toEqual(quickActions);
      expect(result.swimLanes).toEqual(swimLanes);
    });
  });

  describe('config resolution fallback', () => {
    it('falls back to YAML config when resolver.resolve() throws', async () => {
      mockResolverResolve.mockRejectedValueOnce(new Error('DB unavailable'));

      const deps = createBaseDeps();
      deps.adminConfig = {} as AdminConfigService;

      const result = await initializeOrchestrator(deps);

      expect(deps.configResolution.setResolver).toHaveBeenCalled();
      expect(deps.configResolution.setLastResolvedModel).toHaveBeenCalledWith(
        DEFAULT_LLAMA_STACK_CONFIG.model,
      );
      expect(
        deps.configResolution.setLastResolvedVerboseLogging,
      ).toHaveBeenCalledWith(
        DEFAULT_LLAMA_STACK_CONFIG.verboseStreamLogging ?? false,
      );
      expect(result).toBeDefined();
    });

    it('uses resolved model when resolver.resolve() succeeds', async () => {
      const resolvedModel = 'override-model';
      mockResolverResolve.mockResolvedValueOnce({
        model: resolvedModel,
        verboseStreamLogging: true,
      });

      const deps = createBaseDeps();
      deps.adminConfig = {} as AdminConfigService;

      await initializeOrchestrator(deps);

      expect(deps.configResolution.setLastResolvedModel).toHaveBeenCalledWith(
        resolvedModel,
      );
      expect(
        deps.configResolution.setLastResolvedVerboseLogging,
      ).toHaveBeenCalledWith(true);
    });
  });

  describe('partial failure', () => {
    it('when docSync.initialize() throws, earlier steps are set up and error propagates', async () => {
      const initError = new Error('Document sync init failed');
      mockDocSyncInitialize.mockRejectedValueOnce(initError);

      const deps = createBaseDeps();

      await expect(initializeOrchestrator(deps)).rejects.toThrow(
        'Document sync init failed',
      );

      expect(deps.configResolution.setLlamaStackConfig).toHaveBeenCalled();
      expect(deps.vectorStoreFacade.setServices).not.toHaveBeenCalled();
    });
  });

  describe('error propagation', () => {
    it('when configLoader.validateRequiredConfig() throws, error propagates', async () => {
      const configError = new Error('Llama Stack not configured');
      const deps = createBaseDeps();
      deps.configLoader.validateRequiredConfig = jest
        .fn()
        .mockImplementation(() => {
          throw configError;
        });

      await expect(initializeOrchestrator(deps)).rejects.toThrow(
        'Llama Stack not configured',
      );

      expect(deps.configLoader.loadSecurityConfig).not.toHaveBeenCalled();
      expect(deps.configResolution.setLlamaStackConfig).not.toHaveBeenCalled();
      expect(deps.vectorStoreFacade.setServices).not.toHaveBeenCalled();
    });
  });
});
