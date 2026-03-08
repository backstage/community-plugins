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

jest.mock('./sseStreaming', () => ({
  parseSSEStream: jest.fn().mockResolvedValue(undefined),
}));

import type { ChatApiDeps } from './chatEndpoints';
import {
  chat,
  chatStream,
  chatStreamWithSession,
  submitToolApproval,
} from './chatEndpoints';
import { createMockResponse } from '../test-utils/factories';

describe('chatEndpoints', () => {
  const baseUrl = 'http://localhost:7007/api/agentic-chat';

  function createDeps(overrides: Partial<ChatApiDeps> = {}): ChatApiDeps {
    return {
      fetchJson: jest.fn(),
      discoveryApi: {
        getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
      } as unknown as ChatApiDeps['discoveryApi'],
      fetchApi: {
        fetch: jest.fn(),
      } as unknown as ChatApiDeps['fetchApi'],
      ...overrides,
    };
  }

  describe('chat', () => {
    it('should call fetchJson with correct path and body', async () => {
      const deps = createDeps();
      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const mockResponse = { id: 'resp-1', output: [] };

      (deps.fetchJson as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chat(deps, messages, true);

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            enableRAG: true,
            previousResponseId: undefined,
            conversationId: undefined,
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass optional previousResponseId and conversationId', async () => {
      const deps = createDeps();
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      (deps.fetchJson as jest.Mock).mockResolvedValue({});

      await chat(deps, messages, false, undefined, 'prev-123', 'conv-456');

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/chat',
        expect.objectContaining({
          body: JSON.stringify({
            messages,
            enableRAG: false,
            previousResponseId: 'prev-123',
            conversationId: 'conv-456',
          }),
        }),
      );
    });

    it('should pass AbortSignal when provided', async () => {
      const deps = createDeps();
      const signal = new AbortController().signal;

      (deps.fetchJson as jest.Mock).mockResolvedValue({});

      await chat(deps, [], true, signal);

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/chat',
        expect.objectContaining({
          signal,
        }),
      );
    });

    it('should propagate fetch errors', async () => {
      const deps = createDeps();
      const err = new Error('Network error');
      (deps.fetchJson as jest.Mock).mockRejectedValue(err);

      await expect(chat(deps, [], true)).rejects.toThrow('Network error');
    });
  });

  describe('chatStream', () => {
    it('should call fetchApi.fetch with stream URL and invoke parseSSEStream', async () => {
      const deps = createDeps();
      const onEvent = jest.fn();
      const messages = [{ role: 'user' as const, content: 'Stream me' }];

      const mockReader = {
        read: jest.fn(),
        releaseLock: jest.fn(),
      } as unknown as ReadableStreamDefaultReader<Uint8Array>;
      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          ok: true,
          body: {
            getReader: () => mockReader,
          } as unknown as ReadableStream,
        }),
      );

      await chatStream(deps, messages, onEvent, true);

      expect(deps.discoveryApi.getBaseUrl).toHaveBeenCalledWith('agentic-chat');
      expect(deps.fetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/chat/stream`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            enableRAG: true,
            previousResponseId: undefined,
            conversationId: undefined,
          }),
        }),
      );
      const { parseSSEStream } = require('./sseStreaming');
      expect(parseSSEStream).toHaveBeenCalledWith(
        mockReader,
        onEvent,
        undefined,
      );
    });

    it('should pass optional previousResponseId and conversationId', async () => {
      const deps = createDeps();
      const onEvent = jest.fn();
      const messages = [{ role: 'user' as const, content: 'Hi' }];

      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          ok: true,
          body: {
            getReader: () =>
              ({
                read: jest
                  .fn()
                  .mockResolvedValue({ done: true, value: undefined }),
                releaseLock: jest.fn(),
              } as unknown as ReadableStreamDefaultReader<Uint8Array>),
          } as unknown as ReadableStream,
        }),
      );

      await chatStream(
        deps,
        messages,
        onEvent,
        false,
        undefined,
        'prev-1',
        'conv-1',
      );

      expect(deps.fetchApi.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            messages,
            enableRAG: false,
            previousResponseId: 'prev-1',
            conversationId: 'conv-1',
          }),
        }),
      );
    });

    it('should throw when response is not ok', async () => {
      const deps = createDeps();
      const onEvent = jest.fn();

      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 400,
          text: jest
            .fn()
            .mockResolvedValue('{"error":{"message":"Bad request"}}'),
        }),
      );

      await expect(chatStream(deps, [], onEvent, true)).rejects.toThrow(
        /Stream request failed: 400/,
      );
    });

    it('should throw when response has no body', async () => {
      const deps = createDeps();
      const onEvent = jest.fn();

      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({ ok: true, body: null }),
      );

      await expect(chatStream(deps, [], onEvent, true)).rejects.toThrow(
        'No response body for streaming',
      );
    });
  });

  describe('chatStreamWithSession', () => {
    it('should call stream with sessionId in body', async () => {
      const deps = createDeps();
      const onEvent = jest.fn();
      const messages = [{ role: 'user' as const, content: 'Session chat' }];
      const sessionId = 'session-xyz';

      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          ok: true,
          body: {
            getReader: () =>
              ({
                read: jest
                  .fn()
                  .mockResolvedValue({ done: true, value: undefined }),
                releaseLock: jest.fn(),
              } as unknown as ReadableStreamDefaultReader<Uint8Array>),
          } as unknown as ReadableStream,
        }),
      );

      await chatStreamWithSession(deps, messages, onEvent, sessionId, true);

      expect(deps.fetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/chat/stream`,
        expect.objectContaining({
          body: JSON.stringify({
            messages,
            enableRAG: true,
            sessionId,
          }),
        }),
      );
    });
  });

  describe('submitToolApproval', () => {
    it('should call fetchJson with approval payload', async () => {
      const deps = createDeps();
      const mockResult = {
        success: true,
        content: 'Done',
        responseId: 'resp-2',
      };

      (deps.fetchJson as jest.Mock).mockResolvedValue(mockResult);

      const result = await submitToolApproval(
        deps,
        'resp-1',
        'call-1',
        true,
        'tool_name',
        '{"arg":"value"}',
      );

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/chat/approve',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responseId: 'resp-1',
            callId: 'call-1',
            approved: true,
            toolName: 'tool_name',
            toolArguments: '{"arg":"value"}',
          }),
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it('should work without toolName and toolArguments', async () => {
      const deps = createDeps();
      (deps.fetchJson as jest.Mock).mockResolvedValue({
        success: false,
        rejected: true,
      });

      const result = await submitToolApproval(deps, 'resp-1', 'call-1', false);

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/chat/approve',
        expect.objectContaining({
          body: JSON.stringify({
            responseId: 'resp-1',
            callId: 'call-1',
            approved: false,
            toolName: undefined,
            toolArguments: undefined,
          }),
        }),
      );
      expect(result.rejected).toBe(true);
    });

    it('should pass AbortSignal when provided', async () => {
      const deps = createDeps();
      const signal = new AbortController().signal;

      (deps.fetchJson as jest.Mock).mockResolvedValue({ success: true });

      await submitToolApproval(
        deps,
        'r',
        'c',
        true,
        undefined,
        undefined,
        signal,
      );

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/chat/approve',
        expect.objectContaining({ signal }),
      );
    });

    it('should propagate fetch errors', async () => {
      const deps = createDeps();
      (deps.fetchJson as jest.Mock).mockRejectedValue(
        new Error('Approval failed'),
      );

      await expect(submitToolApproval(deps, 'r', 'c', true)).rejects.toThrow(
        'Approval failed',
      );
    });
  });
});
