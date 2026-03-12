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
import type { LlamaStackClient } from './LlamaStackClient';
import type { MCPServerConfig } from '../../types';
import {
  executeApprovalContinuation,
  type ApprovalContinuationDeps,
  type ApprovalContinuationParams,
} from './ApprovalContinuationExecutor';
import { createMockLogger } from '../../test-utils/mocks';

function createMockClient(): LlamaStackClient & { request: jest.Mock } {
  const request = jest.fn();
  return { request } as unknown as LlamaStackClient & { request: jest.Mock };
}

function createMockMcpAuth(): {
  getServerHeaders: jest.Mock;
  getApiApprovalConfig: jest.Mock;
} {
  return {
    getServerHeaders: jest.fn().mockResolvedValue({}),
    getApiApprovalConfig: jest.fn().mockReturnValue('never'),
  };
}

function createBaseDeps(
  overrides?: Partial<ApprovalContinuationDeps>,
): ApprovalContinuationDeps {
  const mockClient = createMockClient();
  const mcpAuth = createMockMcpAuth();
  return {
    clientAccessor: {
      getClient: () => mockClient,
      getModel: () => 'test-model',
    },
    mcpAuth: mcpAuth as unknown as ApprovalContinuationDeps['mcpAuth'],
    mcpServers: [],
    proxyModeEnabled: false,
    getConversationForResponse: jest.fn().mockResolvedValue(undefined),
    registerResponse: jest.fn().mockResolvedValue(undefined),
    logger: createMockLogger(),
    ...overrides,
  };
}

function createBaseParams(
  overrides?: Partial<ApprovalContinuationParams>,
): ApprovalContinuationParams {
  return {
    responseId: 'resp-1',
    approvalRequestId: 'apr-1',
    approved: true,
    toolName: 'projects_list',
    toolArguments: '{"org":"acme"}',
    attempt: 0,
    maxAttempts: 3,
    ...overrides,
  };
}

describe('executeApprovalContinuation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Successful approval flow', () => {
    it('approved tool call executes and returns response', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [
          {
            type: 'mcp_call',
            name: 'projects_list',
            output: '{"projects":["alpha","beta"]}',
          },
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Here are your projects.' }],
          },
        ],
      });

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: true,
        toolName: 'projects_list',
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(result.toolExecuted).toBe(true);
      expect(result.responseId).toBe('resp-2');
      expect(result.content).toBe('Here are your projects.');
      expect(result.toolOutput).toBe('{"projects":["alpha","beta"]}');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/openai/v1/responses',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        }),
      );
    });

    it('uses conversationId when provided', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [{ type: 'mcp_call', name: 'projects_list', output: 'ok' }],
      });

      const registerResponse = jest.fn().mockResolvedValue(undefined);
      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
        registerResponse,
      });
      const params = createBaseParams({
        conversationId: 'conv-123',
        approved: true,
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(result.responseId).toBe('resp-2');
      expect(registerResponse).toHaveBeenCalledWith('conv-123', 'resp-2');
    });

    it('resolves conversationId from registry when not provided', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [{ type: 'mcp_call', name: 'projects_list', output: 'ok' }],
      });

      const getConversationForResponse = jest
        .fn()
        .mockResolvedValue('conv-from-registry');
      const registerResponse = jest.fn().mockResolvedValue(undefined);
      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
        getConversationForResponse,
        registerResponse,
      });
      const params = createBaseParams({ approved: true });

      await executeApprovalContinuation(deps, params);

      expect(getConversationForResponse).toHaveBeenCalledWith('resp-1');
      expect(registerResponse).toHaveBeenCalledWith(
        'conv-from-registry',
        'resp-2',
      );
    });
  });

  describe('2. Rejected tool call', () => {
    it('denied tool call returns appropriate response without executing', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [],
      });

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: false,
        toolName: 'deploy_app',
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(result.toolExecuted).toBe(false);
      expect(result.responseId).toBe('resp-2');
      expect(result.content).toContain('Tool Rejected');
      expect(result.content).toContain('deploy_app');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/openai/v1/responses',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"approve":false'),
        }),
      );
    });
  });

  describe('3. Auto-reapproval', () => {
    it('auto-approves chained approval request for same tool (recursive)', async () => {
      const mockClient = createMockClient();
      mockClient.request
        .mockResolvedValueOnce({
          id: 'resp-2',
          output: [
            {
              type: 'mcp_approval_request',
              id: 'apr-2',
              name: 'projects_list',
              server_label: 'ocp-mcp',
              arguments: '{"org":"other"}',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'resp-3',
          output: [
            {
              type: 'mcp_call',
              name: 'projects_list',
              output: '{"projects":["x","y"]}',
            },
            {
              type: 'message',
              content: [{ type: 'output_text', text: 'Done.' }],
            },
          ],
        });

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: true,
        toolName: 'projects_list',
        attempt: 0,
        maxAttempts: 3,
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(mockClient.request).toHaveBeenCalledTimes(2);
      expect(result.toolExecuted).toBe(true);
      expect(result.responseId).toBe('resp-3');
      expect(result.content).toBe('Done.');
    });

    it('stops auto-reapproval when maxAttempts reached', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [
          {
            type: 'mcp_approval_request',
            id: 'apr-2',
            name: 'projects_list',
            arguments: '{}',
          },
        ],
      });

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: true,
        toolName: 'projects_list',
        attempt: 3,
        maxAttempts: 3,
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(mockClient.request).toHaveBeenCalledTimes(1);
      expect(result.pendingApproval).toBeDefined();
      expect(result.pendingApproval?.approvalRequestId).toBe('apr-2');
    });

    it('does not auto-reapprove when chained tool is different', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [
          {
            type: 'mcp_approval_request',
            id: 'apr-2',
            name: 'deploy_app',
            arguments: '{}',
          },
        ],
      });

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: true,
        toolName: 'projects_list',
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(mockClient.request).toHaveBeenCalledTimes(1);
      expect(result.pendingApproval).toBeDefined();
      expect(result.pendingApproval?.toolName).toBe('deploy_app');
    });

    it('does not auto-reapprove when user originally rejected', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [
          {
            type: 'mcp_approval_request',
            id: 'apr-2',
            name: 'projects_list',
            arguments: '{}',
          },
        ],
      });

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: false,
        toolName: 'projects_list',
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(mockClient.request).toHaveBeenCalledTimes(1);
      expect(result.toolExecuted).toBe(false);
      expect(result.content).toContain('Tool Rejected');
    });
  });

  describe('4. Error handling', () => {
    it('returns error content when API call fails (approved)', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockRejectedValue(new Error('Connection refused'));

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: true,
        toolName: 'projects_list',
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(result.toolExecuted).toBe(false);
      expect(result.responseId).toBe('resp-1');
      expect(result.content).toContain('Failed to execute tool');
      expect(result.content).toContain('projects_list');
      expect(result.content).toContain('Connection refused');
    });

    it('returns error content when API call fails (rejected)', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockRejectedValue(new Error('Network timeout'));

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: false,
        toolName: 'deploy_app',
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(result.toolExecuted).toBe(false);
      expect(result.content).toContain('Failed to reject tool');
      expect(result.content).toContain('Network timeout');
    });

    it('uses "unknown" when toolName is undefined in error', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockRejectedValue(new Error('Server error'));

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
      });
      const params = createBaseParams({
        approved: true,
        toolName: undefined,
      });

      const result = await executeApprovalContinuation(deps, params);

      expect(result.content).toContain('unknown');
      expect(result.content).toContain('Server error');
    });
  });

  describe('5. MCP tool building', () => {
    const directModeServer: MCPServerConfig = {
      id: 'srv-1',
      name: 'Server 1',
      type: 'streamable-http',
      url: 'http://mcp.example.com/direct',
    };

    const proxyModeServer: MCPServerConfig = {
      id: 'srv-proxy',
      name: 'Proxy Server',
      type: 'streamable-http',
      url: 'http://mcp.internal/proxy',
      allowedTools: ['tool_a', 'tool_b'],
    };

    it('direct mode: uses server URL and calls getServerHeaders', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [{ type: 'mcp_call', name: 'projects_list', output: 'ok' }],
      });

      const mcpAuth = createMockMcpAuth();
      mcpAuth.getServerHeaders.mockResolvedValue({
        Authorization: 'Bearer token123',
      });

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
        mcpServers: [directModeServer],
        mcpAuth: mcpAuth as unknown as ApprovalContinuationDeps['mcpAuth'],
        proxyModeEnabled: false,
      });
      const params = createBaseParams();

      await executeApprovalContinuation(deps, params);

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.tools).toHaveLength(1);
      expect(body.tools[0]).toMatchObject({
        type: 'mcp',
        server_url: 'http://mcp.example.com/direct',
        server_label: 'srv-1',
        headers: { Authorization: 'Bearer token123' },
      });
      expect(mcpAuth.getServerHeaders).toHaveBeenCalledWith(directModeServer);
    });

    it('proxy mode: uses getProxyUrl and prefixes allowed_tools', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [{ type: 'mcp_call', name: 'srv_proxy__tool_a', output: 'ok' }],
      });

      const mcpProxy = {
        getProxyUrl: jest.fn(
          (id: string) => `http://proxy.local/mcp-proxy/${id}`,
        ),
      };

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
        mcpServers: [proxyModeServer],
        proxyModeEnabled: true,
        mcpProxy: mcpProxy as unknown as ApprovalContinuationDeps['mcpProxy'],
      });
      const params = createBaseParams();

      await executeApprovalContinuation(deps, params);

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.tools).toHaveLength(1);
      expect(body.tools[0]).toMatchObject({
        type: 'mcp',
        server_url: 'http://proxy.local/mcp-proxy/srv-proxy',
        server_label: 'srv-proxy',
        allowed_tools: ['srv_proxy__tool_a', 'srv_proxy__tool_b'],
      });
      expect(mcpProxy.getProxyUrl).toHaveBeenCalledWith('srv-proxy');
    });

    it('proxy mode: does not call getServerHeaders', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [],
      });

      const mcpAuth = createMockMcpAuth();
      const mcpProxy = {
        getProxyUrl: jest.fn(
          (id: string) => `http://proxy.local/mcp-proxy/${id}`,
        ),
      };

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
        mcpServers: [proxyModeServer],
        mcpAuth: mcpAuth as unknown as ApprovalContinuationDeps['mcpAuth'],
        proxyModeEnabled: true,
        mcpProxy: mcpProxy as unknown as ApprovalContinuationDeps['mcpProxy'],
      });
      const params = createBaseParams();

      await executeApprovalContinuation(deps, params);

      expect(mcpAuth.getServerHeaders).not.toHaveBeenCalled();
    });

    it('includes require_approval from getApiApprovalConfig', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-2',
        output: [{ type: 'mcp_call', name: 'projects_list', output: 'ok' }],
      });

      const mcpAuth = createMockMcpAuth();
      mcpAuth.getApiApprovalConfig.mockReturnValue('always');

      const serverWithApproval: MCPServerConfig = {
        ...directModeServer,
        requireApproval: 'always',
      };

      const deps = createBaseDeps({
        clientAccessor: {
          getClient: () => mockClient,
          getModel: () => 'test-model',
        },
        mcpServers: [serverWithApproval],
        mcpAuth: mcpAuth as unknown as ApprovalContinuationDeps['mcpAuth'],
      });
      const params = createBaseParams();

      await executeApprovalContinuation(deps, params);

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.tools[0].require_approval).toBe('always');
      expect(mcpAuth.getApiApprovalConfig).toHaveBeenCalledWith('always');
    });
  });
});
