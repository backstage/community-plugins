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

import { renderHook, act, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { useToolApproval, UseToolApprovalOptions } from './useToolApproval';
import { agenticChatApiRef, type AgenticChatApi } from '../api';
import { StreamingState } from '../components/StreamingMessage';
import type { Message } from './useStreamingChat';

const createMockApi = (
  submitResult: {
    success: boolean;
    content?: string;
    responseId?: string;
    toolOutput?: string;
  } = { success: true },
): Partial<AgenticChatApi> => ({
  submitToolApproval: jest.fn().mockResolvedValue(submitResult),
});

const createStreamingStateWithApproval = (): StreamingState => ({
  phase: 'pending_approval',
  text: '',
  toolCalls: [],
  filesSearched: [],
  ragSources: [],
  completed: false,
  pendingApproval: {
    toolCallId: 'call-123',
    responseId: 'response-456',
    toolName: 'delete_pod',
    serverLabel: 'k8s-server',
    arguments: '{"name":"pod-1","namespace":"default"}',
    requestedAt: new Date().toISOString(),
  },
});

describe('useToolApproval', () => {
  const createWrapper = (api: Partial<AgenticChatApi>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <TestApiProvider apis={[[agenticChatApiRef, api as AgenticChatApi]]}>
        {children}
      </TestApiProvider>
    );
  };

  const createDefaultOptions = (
    overrides: Partial<UseToolApprovalOptions> = {},
  ): UseToolApprovalOptions => ({
    streamingState: null,
    messages: [],
    onMessagesChange: jest.fn(),
    onClearStreamingState: jest.fn(),
    onSetTyping: jest.fn(),
    ...overrides,
  });

  describe('initial state', () => {
    it('should have no pending approval initially', () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions()),
        {
          wrapper: createWrapper(mockApi),
        },
      );

      expect(result.current.pendingApproval).toBeNull();
      expect(result.current.isApprovalSubmitting).toBe(false);
    });
  });

  describe('pending approval detection', () => {
    it('should detect pending approval from streaming state', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      expect(result.current.pendingApproval?.toolCall.name).toBe('delete_pod');
      expect(result.current.pendingApproval?.severity).toBe('critical'); // 'delete' pattern
    });

    it('should determine severity based on tool name - warning', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();
      streamingState.pendingApproval!.toolName = 'update_deployment';

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval?.severity).toBe('warning');
      });
    });

    it('should determine severity based on tool name - info', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();
      streamingState.pendingApproval!.toolName = 'get_pods';

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval?.severity).toBe('info');
      });
    });

    it('should parse arguments for display', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(
          result.current.pendingApproval?.toolCall.parsedArguments,
        ).toEqual({
          name: 'pod-1',
          namespace: 'default',
        });
      });
    });

    it('should handle invalid JSON arguments gracefully', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();
      streamingState.pendingApproval!.arguments = 'invalid json';

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(
          result.current.pendingApproval?.toolCall.parsedArguments,
        ).toEqual({
          raw: 'invalid json',
        });
      });
    });
  });

  describe('handleApprove', () => {
    it('should call API with correct parameters', async () => {
      const mockApi = createMockApi({
        success: true,
        content: 'Done',
        responseId: 'new-123',
      });
      const streamingState = createStreamingStateWithApproval();
      const onMessagesChange = jest.fn();
      const onClearStreamingState = jest.fn();
      const onSetTyping = jest.fn();

      const { result } = renderHook(
        () =>
          useToolApproval(
            createDefaultOptions({
              streamingState,
              onMessagesChange,
              onClearStreamingState,
              onSetTyping,
            }),
          ),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleApprove('call-123');
      });

      expect(mockApi.submitToolApproval).toHaveBeenCalledWith(
        'response-456', // responseId
        'call-123', // approvalId
        true, // approved
        'delete_pod', // toolName
        expect.any(String), // arguments
        expect.any(Object), // AbortSignal
      );
    });

    it('should add response message on success', async () => {
      const mockApi = createMockApi({
        success: true,
        content: 'Pod deleted successfully',
        responseId: 'new-456',
        toolOutput: 'Raw output',
      });
      const streamingState = createStreamingStateWithApproval();
      const onMessagesChange = jest.fn();
      const existingMessages: Message[] = [
        {
          id: '1',
          text: 'Delete the pod',
          isUser: true,
          timestamp: new Date(),
        },
      ];

      const { result } = renderHook(
        () =>
          useToolApproval(
            createDefaultOptions({
              streamingState,
              messages: existingMessages,
              onMessagesChange,
            }),
          ),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleApprove('call-123');
      });

      expect(onMessagesChange).toHaveBeenCalled();
      const newMessages = onMessagesChange.mock.calls[0][0];
      expect(newMessages).toHaveLength(2);
      expect(newMessages[1].text).toBe('Pod deleted successfully');
      expect(newMessages[1].toolCalls[0].output).toBe('Raw output');
    });

    it('should clear streaming state on success', async () => {
      const mockApi = createMockApi({ success: true });
      const streamingState = createStreamingStateWithApproval();
      const onClearStreamingState = jest.fn();

      const { result } = renderHook(
        () =>
          useToolApproval(
            createDefaultOptions({
              streamingState,
              onClearStreamingState,
            }),
          ),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleApprove('call-123');
      });

      expect(onClearStreamingState).toHaveBeenCalled();
    });

    it('should set isApprovalSubmitting during submission', async () => {
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise(resolve => {
        resolveSubmit = resolve;
      });
      const mockApi: Partial<AgenticChatApi> = {
        submitToolApproval: jest.fn().mockReturnValue(submitPromise),
      };
      const streamingState = createStreamingStateWithApproval();

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      let approvePromise: Promise<void>;
      act(() => {
        approvePromise = result.current.handleApprove('call-123');
      });

      expect(result.current.isApprovalSubmitting).toBe(true);

      await act(async () => {
        resolveSubmit!({ success: true });
        await approvePromise;
      });

      expect(result.current.isApprovalSubmitting).toBe(false);
    });

    it('should use modified arguments when provided', async () => {
      const mockApi = createMockApi({ success: true });
      const streamingState = createStreamingStateWithApproval();

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleApprove('call-123', '{"modified":"args"}');
      });

      expect(mockApi.submitToolApproval).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        true,
        'delete_pod',
        '{"modified":"args"}',
        expect.any(Object), // AbortSignal
      );
    });
  });

  describe('handleReject', () => {
    it('should call API with rejected flag', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();

      const { result } = renderHook(
        () => useToolApproval(createDefaultOptions({ streamingState })),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleReject('call-123', 'User cancelled');
      });

      expect(mockApi.submitToolApproval).toHaveBeenCalledWith(
        'response-456',
        'call-123',
        false, // rejected
        undefined,
        undefined,
        expect.any(Object), // AbortSignal
      );
    });

    it('should add rejection message', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();
      const onMessagesChange = jest.fn();

      const { result } = renderHook(
        () =>
          useToolApproval(
            createDefaultOptions({
              streamingState,
              onMessagesChange,
            }),
          ),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleReject('call-123', 'User cancelled');
      });

      expect(onMessagesChange).toHaveBeenCalled();
      const newMessages = onMessagesChange.mock.calls[0][0];
      expect(newMessages[0].text).toContain('Cancelled');
      expect(newMessages[0].text).toContain('delete_pod');
    });

    it('should call onClearStreamingState on reject', async () => {
      const mockApi = createMockApi();
      const streamingState = createStreamingStateWithApproval();
      const onClearStreamingState = jest.fn();

      const { result } = renderHook(
        () =>
          useToolApproval(
            createDefaultOptions({
              streamingState,
              onClearStreamingState,
            }),
          ),
        { wrapper: createWrapper(mockApi) },
      );

      await waitFor(() => {
        expect(result.current.pendingApproval).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleReject('call-123');
      });

      // Should call the clear callback
      expect(onClearStreamingState).toHaveBeenCalled();
    });
  });
});
