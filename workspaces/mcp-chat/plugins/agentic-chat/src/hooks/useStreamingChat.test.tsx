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
import {
  useStreamingChat,
  UseStreamingChatOptions,
  stripEchoedToolOutput,
} from './useStreamingChat';
import { type AgenticChatApi } from '../api';
import { createApiTestWrapper } from '../test-utils/renderWithApi';
import { EVENT_TYPES, ToolCallState } from '../components/StreamingMessage';

function createMockApi(
  overrides: Partial<AgenticChatApi> = {},
): Partial<AgenticChatApi> {
  return {
    createSession: jest
      .fn()
      .mockResolvedValue({ id: 'session-1', title: 'Test' }),
    createConversation: jest
      .fn()
      .mockResolvedValue({ conversationId: 'conv-1' }),
    chatStreamWithSession: jest.fn().mockResolvedValue(undefined),
    chatStream: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createDefaultOptions(
  overrides: Partial<UseStreamingChatOptions> = {},
): UseStreamingChatOptions {
  return {
    enableRAG: false,
    onMessagesChange: jest.fn(),
    onScrollToBottom: jest.fn(),
    onSessionCreated: jest.fn(),
    ...overrides,
  };
}

describe('useStreamingChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });
    jest
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return null streaming state initially', () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions()),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      expect(result.current.streamingState).toBeNull();
      expect(result.current.isTyping).toBe(false);
    });

    it('should expose setter functions', () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions()),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.cancelRequest).toBe('function');
      expect(typeof result.current.resetConversation).toBe('function');
      expect(typeof result.current.setStreamingState).toBe('function');
      expect(typeof result.current.setIsTyping).toBe('function');
      expect(typeof result.current.setPreviousResponseId).toBe('function');
      expect(typeof result.current.setConversationId).toBe('function');
      expect(typeof result.current.setSessionId).toBe('function');
    });
  });

  describe('sendMessage', () => {
    it('should add the user message immediately via onMessagesChange', async () => {
      const onMessagesChange = jest.fn();
      const mockApi = createMockApi();

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('Hello', []);
      });

      expect(onMessagesChange).toHaveBeenCalled();
      const firstCall = onMessagesChange.mock.calls[0][0];
      expect(firstCall).toHaveLength(1);
      expect(firstCall[0].text).toBe('Hello');
      expect(firstCall[0].isUser).toBe(true);
    });

    it('should auto-create a session on first message', async () => {
      const onSessionCreated = jest.fn();
      const mockApi = createMockApi();

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onSessionCreated })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('Hello', []);
      });

      expect(mockApi.createSession).toHaveBeenCalledWith('Hello');
      expect(onSessionCreated).toHaveBeenCalledWith('session-1');
    });

    it('should use session-based streaming when session exists', async () => {
      const mockApi = createMockApi();

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions()),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('Hello', []);
      });

      expect(mockApi.chatStreamWithSession).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hello' }],
        expect.any(Function),
        'session-1',
        false,
        expect.any(Object),
      );
    });

    it('should fall back to legacy flow when session creation fails', async () => {
      const mockApi = createMockApi({
        createSession: jest.fn().mockRejectedValue(new Error('No sessions')),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions()),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('Hello', []);
      });

      expect(mockApi.createConversation).toHaveBeenCalled();
      expect(mockApi.chatStream).toHaveBeenCalled();
    });

    it('should add an error message on failure', async () => {
      const onMessagesChange = jest.fn();
      const mockApi = createMockApi({
        createSession: jest.fn().mockRejectedValue(new Error('No sessions')),
        createConversation: jest.fn().mockRejectedValue(new Error('No conv')),
        chatStream: jest.fn().mockRejectedValue(new Error('Network error')),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('Hello', []);
      });

      // onMessagesChange is called first with user message, then with error
      const lastCall =
        onMessagesChange.mock.calls[onMessagesChange.mock.calls.length - 1][0];
      const errorMsg = lastCall[lastCall.length - 1];
      expect(errorMsg.isUser).toBe(false);
      expect(errorMsg.text).toContain('Network error');
    });

    it('should not add error message on intentional abort', async () => {
      const onMessagesChange = jest.fn();
      const abortError = new DOMException('Aborted', 'AbortError');
      const mockApi = createMockApi({
        createSession: jest
          .fn()
          .mockResolvedValue({ id: 'sess-1', title: 'T' }),
        chatStreamWithSession: jest.fn().mockRejectedValue(abortError),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('Hello', []);
      });

      // Should have the initial user message call, but no error message appended
      const lastCall =
        onMessagesChange.mock.calls[onMessagesChange.mock.calls.length - 1][0];
      const lastMsg = lastCall[lastCall.length - 1];
      expect(lastMsg.isUser).toBe(true);
    });
  });

  describe('cancelRequest', () => {
    it('should be a no-op when no request is in flight', () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions()),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      // No request is active, so cancelRequest should not throw
      act(() => {
        result.current.cancelRequest();
      });

      expect(result.current.isTyping).toBe(false);
      expect(result.current.streamingState).toBeNull();
    });
  });

  describe('resetConversation', () => {
    it('should clear conversation state', () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions()),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      act(() => {
        result.current.setConversationId('conv-1');
        result.current.setPreviousResponseId('resp-1');
        result.current.setSessionId('sess-1');
      });

      act(() => {
        result.current.resetConversation();
      });

      // Internal state is reset — the only visible effect is that
      // the next sendMessage would create a new session/conversation
      expect(result.current.isTyping).toBe(false);
      expect(result.current.streamingState).toBeNull();
    });
  });

  describe('streaming events', () => {
    it('should process text delta events during streaming', async () => {
      const onMessagesChange = jest.fn();
      let resolveStream: () => void;
      const streamPromise = new Promise<void>(r => {
        resolveStream = r;
      });
      const mockApi = createMockApi({
        chatStreamWithSession: jest
          .fn()
          .mockImplementation(
            async (
              _msgs: unknown,
              onEvent: (event: unknown) => void,
              _sid: unknown,
            ) => {
              onEvent({
                type: EVENT_TYPES.STREAM_TEXT_DELTA,
                delta: 'Hello',
              });
              await streamPromise;
              onEvent({
                type: EVENT_TYPES.STREAM_COMPLETED,
                responseId: 'resp-123',
              });
            },
          ),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      act(() => {
        result.current.sendMessage('test message', []);
      });

      await waitFor(() => {
        expect(result.current.streamingState).not.toBeNull();
        expect(result.current.streamingState?.text).toContain('Hello');
      });

      resolveStream!();
      await act(async () => {
        await Promise.resolve();
      });

      const lastCall =
        onMessagesChange.mock.calls[onMessagesChange.mock.calls.length - 1][0];
      const botMsg = lastCall[lastCall.length - 1];
      expect(botMsg.isUser).toBe(false);
      expect(botMsg.text).toContain('Hello');
    });

    it('should process tool call events during streaming', async () => {
      const onMessagesChange = jest.fn();
      const mockApi = createMockApi({
        chatStreamWithSession: jest
          .fn()
          .mockImplementation(
            async (
              _msgs: unknown,
              onEvent: (event: unknown) => void,
              _sid: unknown,
            ) => {
              onEvent({
                type: EVENT_TYPES.STREAM_TOOL_STARTED,
                callId: 'tool-search-1',
                name: 'search',
                serverLabel: 'test-server',
                arguments: '{}',
              });
              onEvent({
                type: EVENT_TYPES.STREAM_TOOL_COMPLETED,
                callId: 'tool-search-1',
                name: 'search',
                serverLabel: 'test-server',
                output: 'result',
              });
              onEvent({ type: EVENT_TYPES.STREAM_COMPLETED });
            },
          ),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('test message', []);
      });

      const lastCall =
        onMessagesChange.mock.calls[onMessagesChange.mock.calls.length - 1][0];
      const botMsg = lastCall[lastCall.length - 1];
      expect(botMsg.toolCalls).toBeDefined();
      expect(botMsg.toolCalls).toHaveLength(1);
      expect(botMsg.toolCalls![0].name).toBe('search');
      expect(botMsg.toolCalls![0].serverLabel).toBe('test-server');
      expect(botMsg.toolCalls![0].output).toBe('result');
    });

    it('should process file search (RAG) events', async () => {
      const onMessagesChange = jest.fn();
      const mockApi = createMockApi({
        chatStreamWithSession: jest
          .fn()
          .mockImplementation(
            async (
              _msgs: unknown,
              onEvent: (event: unknown) => void,
              _sid: unknown,
            ) => {
              onEvent({
                type: EVENT_TYPES.STREAM_RAG_RESULTS,
                sources: [
                  {
                    filename: 'doc.txt',
                    fileId: 'f1',
                    score: 0.9,
                  },
                ],
              });
              onEvent({
                type: EVENT_TYPES.STREAM_TEXT_DELTA,
                delta: 'Based on the document...',
              });
              onEvent({ type: EVENT_TYPES.STREAM_COMPLETED });
            },
          ),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('test message', []);
      });

      const lastCall =
        onMessagesChange.mock.calls[onMessagesChange.mock.calls.length - 1][0];
      const botMsg = lastCall[lastCall.length - 1];
      expect(botMsg.ragSources).toBeDefined();
      expect(botMsg.ragSources).toHaveLength(1);
      expect(botMsg.ragSources![0].filename).toBe('doc.txt');
      expect(botMsg.ragSources![0].fileId).toBe('f1');
      expect(botMsg.ragSources![0].score).toBe(0.9);
    });

    it('should handle response.completed event with responseId', async () => {
      const onMessagesChange = jest.fn();
      const mockApi = createMockApi({
        chatStreamWithSession: jest
          .fn()
          .mockImplementation(
            async (
              _msgs: unknown,
              onEvent: (event: unknown) => void,
              _sid: unknown,
            ) => {
              onEvent({
                type: EVENT_TYPES.STREAM_STARTED,
                responseId: 'resp-123',
              });
              onEvent({
                type: EVENT_TYPES.STREAM_TEXT_DELTA,
                delta: 'Done',
              });
              onEvent({
                type: EVENT_TYPES.STREAM_COMPLETED,
                responseId: 'resp-123',
              });
            },
          ),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('test message', []);
      });

      const lastCall =
        onMessagesChange.mock.calls[onMessagesChange.mock.calls.length - 1][0];
      const botMsg = lastCall[lastCall.length - 1];
      expect(botMsg.responseId).toBe('resp-123');
    });

    it('should handle streaming error event', async () => {
      const onMessagesChange = jest.fn();
      const mockApi = createMockApi({
        chatStreamWithSession: jest
          .fn()
          .mockImplementation(
            async (
              _msgs: unknown,
              onEvent: (event: unknown) => void,
              _sid: unknown,
            ) => {
              onEvent({
                type: EVENT_TYPES.STREAM_ERROR,
                error: 'Model error',
              });
              onEvent({ type: EVENT_TYPES.STREAM_COMPLETED });
            },
          ),
      });

      const { result } = renderHook(
        () => useStreamingChat(createDefaultOptions({ onMessagesChange })),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.sendMessage('test message', []);
      });

      const lastCall =
        onMessagesChange.mock.calls[onMessagesChange.mock.calls.length - 1][0];
      const botMsg = lastCall[lastCall.length - 1];
      expect(botMsg.isUser).toBe(false);
      expect(botMsg.text).toContain('Model error');
    });
  });
});

describe('stripEchoedToolOutput', () => {
  const makeTool = (output: string): ToolCallState => ({
    id: 'tc-1',
    type: 'tool_call',
    status: 'completed',
    output,
  });

  it('returns text unchanged when no tool calls', () => {
    expect(stripEchoedToolOutput('hello world', [])).toBe('hello world');
  });

  it('returns text unchanged when tool output is short', () => {
    const tc = makeTool('{"ok": true}');
    expect(stripEchoedToolOutput('result: {"ok": true}', [tc])).toBe(
      'result: {"ok": true}',
    );
  });

  it('strips exact-match tool output JSON from text', () => {
    const output = JSON.stringify({
      orderMyLoad: [
        { orderId: 'OMN4048', status: 'created', details: 'a'.repeat(50) },
      ],
    });
    const tc = makeTool(output);
    const text = `Creating the order...\n\n${output}\n\nDone.`;
    const result = stripEchoedToolOutput(text, [tc]);
    expect(result).toBe('Creating the order...\n\nDone.');
    expect(result).not.toContain('orderMyLoad');
  });

  it('strips pretty-printed version of tool output', () => {
    const compact =
      '{"result":"success","data":{"count":42,"items":["a","b","c","d","e","f","g"]}}';
    const tc = makeTool(compact);
    const pretty = JSON.stringify(JSON.parse(compact), null, 2);
    const text = `Here is the result:\n${pretty}`;
    const result = stripEchoedToolOutput(text, [tc]);
    expect(result).toBe('Here is the result:');
  });

  it('preserves non-matching JSON in text', () => {
    const toolOutput =
      '{"action":"createOrder","orderId":"X123","payload":{"type":"standard","count":5}}';
    const tc = makeTool(toolOutput);
    const differentJson =
      '{"schema":{"type":"object","properties":{"name":{"type":"string"},"age":{"type":"number"}}}}';
    const text = `Tool result is shown below.\n\nHere is the schema:\n${differentJson}`;
    const result = stripEchoedToolOutput(text, [tc]);
    expect(result).toContain(differentJson);
  });

  it('handles nested JSON correctly', () => {
    const output =
      '{"outer":{"inner":{"deep":{"value":"test","list":[1,2,3,4,5,6,7,8,9,10]}}}}';
    const tc = makeTool(output);
    const text = `Result:\n${output}\nEnd.`;
    const result = stripEchoedToolOutput(text, [tc]);
    expect(result).toBe('Result:\n\nEnd.');
  });

  it('handles multiple tool outputs', () => {
    const output1 =
      '{"tool":"search","results":["doc1.md","doc2.md","doc3.md","doc4.md","doc5.md"]}';
    const output2 =
      '{"tool":"create","id":"item-42","status":"created","timestamp":"2025-01-01T00:00:00Z"}';
    const tc1 = makeTool(output1);
    const tc2 = makeTool(output2);
    const text = `Search results:\n${output1}\n\nCreated item:\n${output2}\n\nAll done.`;
    const result = stripEchoedToolOutput(text, [tc1, tc2]);
    expect(result).toBe('Search results:\n\nCreated item:\n\nAll done.');
  });

  it('returns empty string when text is only tool output', () => {
    const output =
      '{"orderMyLoad":[{"orderId":"OMN4048","details":"some-long-value-here-to-pass-threshold"}]}';
    const tc = makeTool(output);
    const result = stripEchoedToolOutput(output, [tc]);
    expect(result).toBe('');
  });

  it('handles text with JSON strings containing braces', () => {
    const output =
      '{"message":"Use {name} and {value} as placeholders","count":99,"items":["x","y","z"]}';
    const tc = makeTool(output);
    const text = `Info:\n${output}`;
    const result = stripEchoedToolOutput(text, [tc]);
    expect(result).toBe('Info:');
  });

  it('strips echoed tool arguments (not just outputs)', () => {
    const args =
      '{"namespace":"default","resource":"pods","action":"list","filter":"app=frontend"}';
    const tc: ToolCallState = {
      id: 'tc-1',
      type: 'tool_call',
      status: 'completed',
      arguments: args,
      output: '{"pods":["pod-1"]}',
    };
    const text = `Calling the tool with:\n${args}\n\nDone.`;
    const result = stripEchoedToolOutput(text, [tc]);
    expect(result).toBe('Calling the tool with:\n\nDone.');
    expect(result).not.toContain('namespace');
  });

  it('does not strip short arguments', () => {
    const args = '{"ns":"default"}';
    const tc: ToolCallState = {
      id: 'tc-1',
      type: 'tool_call',
      status: 'completed',
      arguments: args,
      output: '{"ok": true}',
    };
    const text = `Args: ${args}`;
    const result = stripEchoedToolOutput(text, [tc]);
    expect(result).toBe(`Args: ${args}`);
  });
});
