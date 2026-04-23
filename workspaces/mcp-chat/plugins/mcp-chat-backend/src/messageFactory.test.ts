/*
 * Copyright 2026 The Backstage Authors
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
  buildMessageMetadata,
  systemMessage,
  userMessage,
  assistantMessage,
  assistantToolCallMessage,
  toolMessage,
} from './messageFactory';
import { ToolCall } from './types';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('messageFactory', () => {
  describe('buildMessageMetadata', () => {
    it('should return a valid UUID v4 id', () => {
      const metadata = buildMessageMetadata();
      expect(metadata.id).toMatch(UUID_REGEX);
    });

    it('should return a Date timestamp', () => {
      const before = new Date();
      const metadata = buildMessageMetadata();
      const after = new Date();

      expect(metadata.timestamp).toBeInstanceOf(Date);
      expect(metadata.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(metadata.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should generate unique ids on each call', () => {
      const a = buildMessageMetadata();
      const b = buildMessageMetadata();
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('systemMessage', () => {
    it('should create a message with role system', () => {
      const msg = systemMessage('You are helpful.');
      expect(msg.role).toBe('system');
      expect(msg.content).toBe('You are helpful.');
      expect(msg.metadata.id).toMatch(UUID_REGEX);
      expect(msg.metadata.timestamp).toBeInstanceOf(Date);
    });

    it('should not include tool_calls or tool_call_id', () => {
      const msg = systemMessage('prompt');
      expect(msg.tool_calls).toBeUndefined();
      expect(msg.tool_call_id).toBeUndefined();
    });
  });

  describe('userMessage', () => {
    it('should create a message with role user', () => {
      const msg = userMessage('Hello');
      expect(msg.role).toBe('user');
      expect(msg.content).toBe('Hello');
      expect(msg.metadata.id).toMatch(UUID_REGEX);
    });

    it('should not include tool_calls or tool_call_id', () => {
      const msg = userMessage('Hi');
      expect(msg.tool_calls).toBeUndefined();
      expect(msg.tool_call_id).toBeUndefined();
    });
  });

  describe('assistantMessage', () => {
    it('should create a message with role assistant and text content', () => {
      const msg = assistantMessage('Here is the answer.');
      expect(msg.role).toBe('assistant');
      expect(msg.content).toBe('Here is the answer.');
      expect(msg.metadata.id).toMatch(UUID_REGEX);
    });

    it('should not include tool_calls', () => {
      const msg = assistantMessage('reply');
      expect(msg.tool_calls).toBeUndefined();
    });
  });

  describe('assistantToolCallMessage', () => {
    const toolCalls: ToolCall[] = [
      {
        id: 'call_1',
        type: 'function',
        function: { name: 'get_weather', arguments: '{"city":"NYC"}' },
      },
      {
        id: 'call_2',
        type: 'function',
        function: { name: 'search', arguments: '{"q":"test"}' },
      },
    ];

    it('should create an assistant message with null content and tool_calls', () => {
      const msg = assistantToolCallMessage(toolCalls);
      expect(msg.role).toBe('assistant');
      expect(msg.content).toBeNull();
      expect(msg.tool_calls).toEqual(toolCalls);
      expect(msg.metadata.id).toMatch(UUID_REGEX);
    });

    it('should preserve all tool call fields', () => {
      const msg = assistantToolCallMessage(toolCalls);
      expect(msg.tool_calls).toHaveLength(2);
      expect(msg.tool_calls![0].id).toBe('call_1');
      expect(msg.tool_calls![1].function.name).toBe('search');
    });
  });

  describe('toolMessage', () => {
    it('should create a message with role tool and a tool_call_id', () => {
      const msg = toolMessage('result data', 'call_1');
      expect(msg.role).toBe('tool');
      expect(msg.content).toBe('result data');
      expect(msg.tool_call_id).toBe('call_1');
      expect(msg.metadata.id).toMatch(UUID_REGEX);
    });

    it('should not include tool_calls', () => {
      const msg = toolMessage('ok', 'call_2');
      expect(msg.tool_calls).toBeUndefined();
    });
  });
});
