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

import { InputError } from '@backstage/errors';
import { parseChatRequest, parseApprovalRequest } from './chatRequestParsers';

describe('chatRequestParsers', () => {
  describe('parseChatRequest', () => {
    it('parses valid request with messages, enableRAG, previousResponseId, conversationId, sessionId', () => {
      const body = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
        ],
        enableRAG: true,
        previousResponseId: 'resp-123',
        conversationId: 'conv-456',
        sessionId: 'sess-789',
      };

      const result = parseChatRequest(body);

      expect(result.messages).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ]);
      expect(result.enableRAG).toBe(true);
      expect(result.previousResponseId).toBe('resp-123');
      expect(result.conversationId).toBe('conv-456');
      expect(result.sessionId).toBe('sess-789');
    });

    it('throws on missing messages', () => {
      const body = { enableRAG: false };

      expect(() => parseChatRequest(body)).toThrow(InputError);
      expect(() => parseChatRequest(body)).toThrow(
        'messages must be a non-empty array',
      );
    });

    it('throws on empty messages array', () => {
      const body = { messages: [] };

      expect(() => parseChatRequest(body)).toThrow(InputError);
      expect(() => parseChatRequest(body)).toThrow(
        'messages must be a non-empty array',
      );
    });

    it('throws on non-array messages', () => {
      expect(() => parseChatRequest({ messages: 'not-array' })).toThrow(
        InputError,
      );
      expect(() => parseChatRequest({ messages: null })).toThrow(InputError);
      expect(() => parseChatRequest({ messages: {} })).toThrow(InputError);
    });

    it('throws when body is not an object', () => {
      expect(() => parseChatRequest(null)).toThrow(InputError);
      expect(() => parseChatRequest(undefined)).toThrow(InputError);
      expect(() => parseChatRequest('string')).toThrow(InputError);
      expect(() => parseChatRequest(123)).toThrow(InputError);
      expect(() => parseChatRequest(null)).toThrow(
        'Request body must be a JSON object',
      );
    });

    it('handles optional fields with defaults', () => {
      const body = {
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const result = parseChatRequest(body);

      expect(result.messages).toEqual([{ role: 'user', content: 'Hi' }]);
      expect(result.enableRAG).toBe(false);
      expect(result.previousResponseId).toBeUndefined();
      expect(result.conversationId).toBeUndefined();
      expect(result.sessionId).toBeUndefined();
    });

    it('accepts enableRAG true and false', () => {
      expect(
        parseChatRequest({
          messages: [{ role: 'user', content: 'x' }],
          enableRAG: true,
        }).enableRAG,
      ).toBe(true);
      expect(
        parseChatRequest({
          messages: [{ role: 'user', content: 'x' }],
          enableRAG: false,
        }).enableRAG,
      ).toBe(false);
      expect(
        parseChatRequest({ messages: [{ role: 'user', content: 'x' }] })
          .enableRAG,
      ).toBe(false);
    });

    it('accepts user, assistant, and system roles', () => {
      const body = {
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi' },
        ],
      };

      const result = parseChatRequest(body);
      expect(result.messages).toHaveLength(3);
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[1].role).toBe('user');
      expect(result.messages[2].role).toBe('assistant');
    });

    it('throws on invalid message role', () => {
      const body = {
        messages: [{ role: 'invalid', content: 'Hello' }],
      };

      expect(() => parseChatRequest(body)).toThrow(InputError);
      expect(() => parseChatRequest(body)).toThrow(
        'Message role must be user, assistant, or system',
      );
    });

    it('throws when message lacks role or content', () => {
      expect(() => parseChatRequest({ messages: [{ content: 'Hi' }] })).toThrow(
        'Each message must have role (string) and content (string)',
      );
      expect(() => parseChatRequest({ messages: [{ role: 'user' }] })).toThrow(
        'Each message must have role (string) and content (string)',
      );
      expect(() =>
        parseChatRequest({ messages: [{ role: 123, content: 'Hi' }] }),
      ).toThrow('Each message must have role (string) and content (string)');
      expect(() =>
        parseChatRequest({ messages: [{ role: 'user', content: 456 }] }),
      ).toThrow('Each message must have role (string) and content (string)');
    });

    it('throws when message is not an object', () => {
      expect(() => parseChatRequest({ messages: ['string'] })).toThrow(
        'Each message must be an object with role and content',
      );
      expect(() => parseChatRequest({ messages: [null] })).toThrow(
        'Each message must be an object with role and content',
      );
    });

    it('throws on invalid optional field types', () => {
      expect(() =>
        parseChatRequest({
          messages: [{ role: 'user', content: 'x' }],
          previousResponseId: 123,
        }),
      ).toThrow('previousResponseId must be a string');
      expect(() =>
        parseChatRequest({
          messages: [{ role: 'user', content: 'x' }],
          conversationId: 456,
        }),
      ).toThrow('conversationId must be a string');
      expect(() =>
        parseChatRequest({
          messages: [{ role: 'user', content: 'x' }],
          sessionId: [],
        }),
      ).toThrow('sessionId must be a string');
    });
  });

  describe('parseApprovalRequest', () => {
    it('parses valid request with responseId, callId, approved, toolName, toolArguments', () => {
      const body = {
        responseId: 'resp-1',
        callId: 'call-1',
        approved: true,
        toolName: 'get_weather',
        toolArguments: '{"location":"NYC"}',
      };

      const result = parseApprovalRequest(body);

      expect(result.responseId).toBe('resp-1');
      expect(result.callId).toBe('call-1');
      expect(result.approved).toBe(true);
      expect(result.toolName).toBe('get_weather');
      expect(result.toolArguments).toBe('{"location":"NYC"}');
    });

    it('parses valid rejection request (approved: false) without toolName', () => {
      const body = {
        responseId: 'resp-1',
        callId: 'call-1',
        approved: false,
      };

      const result = parseApprovalRequest(body);

      expect(result.responseId).toBe('resp-1');
      expect(result.callId).toBe('call-1');
      expect(result.approved).toBe(false);
      expect(result.toolName).toBeUndefined();
      expect(result.toolArguments).toBeUndefined();
    });

    it('throws on missing responseId', () => {
      expect(() =>
        parseApprovalRequest({
          callId: 'call-1',
          approved: false,
        }),
      ).toThrow(InputError);
      expect(() =>
        parseApprovalRequest({
          callId: 'call-1',
          approved: false,
        }),
      ).toThrow('responseId is required and must be a non-empty string');
    });

    it('throws on empty responseId', () => {
      expect(() =>
        parseApprovalRequest({
          responseId: '',
          callId: 'call-1',
          approved: false,
        }),
      ).toThrow('responseId is required and must be a non-empty string');
    });

    it('throws on missing callId', () => {
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          approved: false,
        }),
      ).toThrow('callId is required and must be a non-empty string');
    });

    it('throws on empty callId', () => {
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          callId: '',
          approved: false,
        }),
      ).toThrow('callId is required and must be a non-empty string');
    });

    it('throws on missing approved', () => {
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          callId: 'call-1',
        }),
      ).toThrow('approved must be a boolean');
    });

    it('throws on non-boolean approved', () => {
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          callId: 'call-1',
          approved: 'true',
        }),
      ).toThrow('approved must be a boolean');
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          callId: 'call-1',
          approved: 1,
        }),
      ).toThrow('approved must be a boolean');
    });

    it('throws when approving without toolName', () => {
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          callId: 'call-1',
          approved: true,
        }),
      ).toThrow('toolName is required when approving a tool call');
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          callId: 'call-1',
          approved: true,
          toolName: '',
        }),
      ).toThrow('toolName is required when approving a tool call');
    });

    it('throws when toolArguments is not a string', () => {
      expect(() =>
        parseApprovalRequest({
          responseId: 'resp-1',
          callId: 'call-1',
          approved: true,
          toolName: 'tool',
          toolArguments: 123,
        }),
      ).toThrow('toolArguments must be a string');
    });

    it('throws when body is not an object', () => {
      expect(() => parseApprovalRequest(null)).toThrow(
        'Request body must be a JSON object',
      );
      expect(() => parseApprovalRequest(undefined)).toThrow(
        'Request body must be a JSON object',
      );
    });
  });
});
