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
  ConversationService,
  ConversationClientAccessor,
} from './ConversationService';
import { McpAuthService } from './McpAuthService';
import { LlamaStackClient } from './LlamaStackClient';
import { createMockLogger } from '../../test-utils/mocks';

function createMockClient(): LlamaStackClient & { request: jest.Mock } {
  const request = jest.fn();
  return { request } as unknown as LlamaStackClient & { request: jest.Mock };
}

function createMockMcpAuth(approvalOverride?: string): McpAuthService {
  return {
    getServerHeaders: jest.fn().mockResolvedValue({}),
    getApiApprovalConfig: jest
      .fn()
      .mockReturnValue(approvalOverride ?? 'never'),
  } as unknown as McpAuthService;
}

function createAccessor(
  client: LlamaStackClient,
  model = 'test-model',
): ConversationClientAccessor {
  return { getClient: () => client, getModel: () => model };
}

describe('ConversationService', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;

  function createService(options?: {
    client?: LlamaStackClient;
    accessor?: ConversationClientAccessor;
    mcpServers?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      requireApproval?: string;
      allowedTools?: string[];
    }>;
    mcpAuth?: McpAuthService;
  }): ConversationService {
    const accessor =
      options?.accessor ??
      createAccessor(options?.client ?? createMockClient());
    return new ConversationService(
      accessor,
      options?.mcpAuth ?? createMockMcpAuth(),
      (options?.mcpServers ?? []) as import('../../types').MCPServerConfig[],
      mockLogger,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = createMockLogger();
  });

  describe('constructor', () => {
    it('creates instance with required dependencies', () => {
      const service = createService();
      expect(service).toBeDefined();
    });
  });

  describe('createConversation', () => {
    it('calls Llama Stack API to create a conversation and returns its ID', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({ id: 'conv_123' });

      const service = createService({ client: mockClient });

      const convId = await service.createConversation();
      expect(convId).toBe('conv_123');
      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/conversations',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('propagates errors from the API', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockRejectedValue(new Error('Connection refused'));

      const service = createService({ client: mockClient });

      await expect(service.createConversation()).rejects.toThrow(
        'Connection refused',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create conversation'),
      );
    });
  });

  describe('markFirstStoredTurn', () => {
    it('returns true for a new conversation ID', () => {
      const service = createService();
      expect(service.markFirstStoredTurn('new-conv')).toBe(true);
    });

    it('returns false after conversation is marked as stored', () => {
      const service = createService();
      expect(service.markFirstStoredTurn('my-conv')).toBe(true);
      expect(service.markFirstStoredTurn('my-conv')).toBe(false);
    });

    it('tracks multiple conversation IDs independently', () => {
      const service = createService();
      expect(service.markFirstStoredTurn('conv-a')).toBe(true);
      expect(service.markFirstStoredTurn('conv-b')).toBe(true);
      expect(service.markFirstStoredTurn('conv-a')).toBe(false);
      expect(service.markFirstStoredTurn('conv-b')).toBe(false);
    });
  });

  describe('registerResponse', () => {
    it('caches the mapping in memory and logs it', async () => {
      const service = createService();
      await service.registerResponse('conv_1', 'resp_1');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('resp_1'),
      );
    });
  });

  describe('getConversationForResponse', () => {
    it('returns undefined for an unknown response ID', async () => {
      const service = createService();
      const result = await service.getConversationForResponse('unknown');
      expect(result).toBeUndefined();
    });

    it('returns cached conversation ID after registerResponse', async () => {
      const service = createService();
      await service.registerResponse('conv_1', 'resp_1');
      const result = await service.getConversationForResponse('resp_1');
      expect(result).toBe('conv_1');
    });
  });

  describe('deleteConversation', () => {
    it('calls Llama Stack API to delete a response and returns true', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({});

      const service = createService({ client: mockClient });

      const result = await service.deleteConversation('resp_delete');
      expect(result).toBe(true);
      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/openai/v1/responses/resp_delete',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('also deletes the conversation container when conversationId is provided', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({});

      const service = createService({ client: mockClient });

      const result = await service.deleteConversation('resp_1', 'conv_1');
      expect(result).toBe(true);
      expect(mockClient.request).toHaveBeenCalledTimes(2);
      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/openai/v1/responses/resp_1',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/conversations/conv_1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('returns false when response deletion fails', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockRejectedValue(new Error('Not found'));

      const service = createService({ client: mockClient });

      const result = await service.deleteConversation('resp_bad');
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete response resp_bad'),
      );
    });

    it('returns true even if conversation container deletion fails (non-fatal)', async () => {
      const mockClient = createMockClient();
      mockClient.request
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Container not found'));

      const service = createService({ client: mockClient });

      const result = await service.deleteConversation('resp_ok', 'conv_gone');
      expect(result).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('non-fatal'),
      );
    });
  });

  describe('dynamic client accessor', () => {
    it('picks up a new client when the accessor returns a different instance', async () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      client1.request.mockResolvedValue({ id: 'conv-from-client1' });
      client2.request.mockResolvedValue({ id: 'conv-from-client2' });

      let activeClient: LlamaStackClient & { request: jest.Mock } = client1;
      const accessor: ConversationClientAccessor = {
        getClient: () => activeClient,
        getModel: () => 'test-model',
      };

      const service = createService({ accessor });

      const id1 = await service.createConversation();
      expect(id1).toBe('conv-from-client1');
      expect(client1.request).toHaveBeenCalledTimes(1);

      activeClient = client2;
      const id2 = await service.createConversation();
      expect(id2).toBe('conv-from-client2');
      expect(client2.request).toHaveBeenCalledTimes(1);
    });

    it('always uses previous_response_id even when registry has conversationId', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-approval-out',
        output: [
          {
            type: 'mcp_call',
            name: 'myTool',
            output: '{"ok":true}',
          },
        ],
      });

      const service = createService({ client: mockClient });

      await service.registerResponse('conv-abc', 'resp-original');

      await service.continueAfterApproval(
        'resp-original',
        'appr-1',
        true,
        'myTool',
        '{"key":"val"}',
      );

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.previous_response_id).toBe('resp-original');
      expect(body.conversation).toBeUndefined();
    });

    it('registers approval response ID in registry for future lookups', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-approval-new',
        output: [
          {
            type: 'mcp_call',
            name: 'myTool',
            output: '{"ok":true}',
          },
        ],
      });

      const service = createService({ client: mockClient });

      await service.registerResponse('conv-abc', 'resp-original');

      await service.continueAfterApproval(
        'resp-original',
        'appr-1',
        true,
        'myTool',
        '{"key":"val"}',
      );

      const convId = await service.getConversationForResponse(
        'resp-approval-new',
      );
      expect(convId).toBe('conv-abc');
    });

    it('uses previous_response_id for rejection even when registry has mapping', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-rejection-out',
        output: [],
      });

      const service = createService({ client: mockClient });

      await service.registerResponse('conv-abc', 'resp-to-reject');

      await service.continueAfterApproval('resp-to-reject', 'appr-1', false);

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.previous_response_id).toBe('resp-to-reject');
      expect(body.conversation).toBeUndefined();
      expect(body.input[0].approve).toBe(false);
    });

    it('falls back to previous_response_id when no registry entry exists', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-approval-out',
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Done' }],
          },
        ],
      });

      const service = createService({ client: mockClient });

      await service.continueAfterApproval(
        'resp-orphan',
        'appr-1',
        true,
        'myTool',
        '{"key":"val"}',
      );

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.previous_response_id).toBe('resp-orphan');
      expect(body.conversation).toBeUndefined();
    });

    it('includes require_approval in approval continuation tools payload', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-approval-out',
        output: [{ type: 'mcp_call', name: 'myTool', output: '{"ok":true}' }],
      });

      const mcpAuth = createMockMcpAuth('always');
      const service = createService({
        client: mockClient,
        mcpServers: [
          {
            id: 'srv-1',
            name: 'Server 1',
            type: 'streamable-http',
            url: 'http://srv1.example.com',
            requireApproval: 'always',
          },
        ],
        mcpAuth,
      });

      await service.continueAfterApproval(
        'resp-1',
        'appr-1',
        true,
        'myTool',
        '{}',
      );

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.tools).toHaveLength(1);
      expect(body.tools[0]).toMatchObject({
        type: 'mcp',
        server_url: 'http://srv1.example.com',
        server_label: 'srv-1',
        require_approval: 'always',
      });
      expect(mcpAuth.getApiApprovalConfig).toHaveBeenCalledWith('always');
    });

    it('includes allowed_tools in approval continuation tools payload', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-approval-out',
        output: [
          { type: 'mcp_call', name: 'allowed_tool', output: '{"ok":true}' },
        ],
      });

      const service = createService({
        client: mockClient,
        mcpServers: [
          {
            id: 'srv-1',
            name: 'Server 1',
            type: 'streamable-http',
            url: 'http://srv1.example.com',
            allowedTools: ['tool_a', 'tool_b'],
          },
        ],
      });

      await service.continueAfterApproval(
        'resp-1',
        'appr-1',
        true,
        'allowed_tool',
        '{}',
      );

      const body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.tools[0].allowed_tools).toEqual(['tool_a', 'tool_b']);
    });

    it('picks up a new model when the accessor returns a different value', async () => {
      const mockClient = createMockClient();
      mockClient.request.mockResolvedValue({
        id: 'resp-approval',
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Done' }],
          },
        ],
      });

      let currentModel = 'model-A';
      const accessor: ConversationClientAccessor = {
        getClient: () => mockClient,
        getModel: () => currentModel,
      };

      const service = createService({ accessor });

      await service.continueAfterApproval(
        'resp-1',
        'appr-1',
        true,
        'myTool',
        '{"key":"val"}',
      );
      let body = JSON.parse(mockClient.request.mock.calls[0][1].body);
      expect(body.model).toBe('model-A');

      currentModel = 'model-B';
      await service.continueAfterApproval(
        'resp-2',
        'appr-2',
        true,
        'myTool',
        '{"key":"val2"}',
      );
      body = JSON.parse(mockClient.request.mock.calls[1][1].body);
      expect(body.model).toBe('model-B');
    });
  });
});
