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
  extractContentFromItem,
  extractUserInputFromRaw,
  getInputText,
  processConversationItems,
} from './MessageProcessor';
import { createMockLogger } from '../../test-utils';
import type { ConversationItem } from './conversationTypes';

describe('MessageProcessor', () => {
  const logger = createMockLogger();

  describe('extractContentFromItem', () => {
    it('returns empty string for undefined', () => {
      expect(extractContentFromItem(undefined)).toBe('');
    });

    it('returns string content as-is', () => {
      expect(extractContentFromItem('Hello world')).toBe('Hello world');
    });

    it('extracts and joins text from input_text, output_text, and text parts', () => {
      const content = [
        { type: 'input_text', text: 'Part1' },
        { type: 'output_text', text: 'Part2' },
        { type: 'text', text: 'Part3' },
        { type: 'other', text: 'Ignored' },
      ];
      expect(extractContentFromItem(content)).toBe('Part1Part2Part3');
    });

    it('skips parts without text or with non-string text', () => {
      const content = [
        { type: 'input_text', text: 'Valid' },
        { type: 'text' },
        { type: 'output_text', text: 123 as unknown as string },
      ];
      expect(extractContentFromItem(content)).toBe('Valid');
    });

    it('returns empty string for empty array', () => {
      expect(extractContentFromItem([])).toBe('');
    });

    it('returns empty string for non-matching array', () => {
      const content = [{ type: 'image', url: 'x' }, { type: 'other' }];
      expect(
        extractContentFromItem(
          content as Array<{ type: string; text?: string }>,
        ),
      ).toBe('');
    });
  });

  describe('extractUserInputFromRaw', () => {
    it('returns string input as-is', () => {
      expect(extractUserInputFromRaw('User query')).toBe('User query');
    });

    it('extracts from message with role user and string content', () => {
      const input = [{ type: 'message', role: 'user', content: 'Hello' }];
      expect(extractUserInputFromRaw(input)).toBe('Hello');
    });

    it('extracts from message with role user and array content', () => {
      const input = [
        {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: 'From array' }],
        },
      ];
      expect(extractUserInputFromRaw(input)).toBe('From array');
    });

    it('extracts from input_text item', () => {
      const input = [{ type: 'input_text', text: 'Direct input' }];
      expect(extractUserInputFromRaw(input)).toBe('Direct input');
    });

    it('returns empty string for empty array', () => {
      expect(extractUserInputFromRaw([])).toBe('');
    });

    it('returns empty string when no user message or input_text', () => {
      const input = [
        { type: 'message', role: 'assistant', content: 'Hi' },
        { type: 'other' },
      ];
      expect(extractUserInputFromRaw(input)).toBe('');
    });

    it('skips null/undefined items in array', () => {
      const input = [null, { type: 'input_text', text: 'Valid' }];
      expect(extractUserInputFromRaw(input as unknown[])).toBe('Valid');
    });
  });

  describe('getInputText', () => {
    it('returns string truncated to 80 chars with ellipsis', () => {
      const long = 'a'.repeat(100);
      expect(getInputText(long)).toBe(`${'a'.repeat(80)}...`);
    });

    it('returns short string without ellipsis', () => {
      expect(getInputText('Short')).toBe('Short');
    });

    it('returns empty string for non-array when input is not string', () => {
      expect(getInputText(null as unknown as string)).toBe('');
    });

    it('extracts from first message in array and truncates', () => {
      const input = [
        {
          type: 'message',
          role: 'user',
          content: 'x'.repeat(100),
        },
      ];
      expect(getInputText(input)).toBe(`${'x'.repeat(80)}...`);
    });

    it('returns empty string for array without message type', () => {
      const input = [{ type: 'other', content: 'x' }];
      expect(getInputText(input)).toBe('');
    });
  });

  describe('processConversationItems', () => {
    it('processes user and assistant messages', () => {
      const items: ConversationItem[] = [
        { type: 'message', role: 'user', content: 'Hello' },
        { type: 'message', role: 'assistant', content: 'Hi there' },
      ];
      const result = processConversationItems(items, logger);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ role: 'user', text: 'Hello' });
      expect(result[1]).toEqual({ role: 'assistant', text: 'Hi there' });
    });

    it('skips mcp_list_tools items', () => {
      const items: ConversationItem[] = [
        { type: 'mcp_list_tools' },
        { type: 'message', role: 'user', content: 'Hi' },
      ];
      const result = processConversationItems(items, logger);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Hi');
    });

    it('groups tool calls with next assistant message', () => {
      const items: ConversationItem[] = [
        { type: 'message', role: 'user', content: 'Use tool' },
        {
          type: 'mcp_call',
          id: 'tc1',
          name: 'my_tool',
          server_label: 'server1',
        },
        { type: 'message', role: 'assistant', content: 'Done' },
      ];
      const result = processConversationItems(items, logger);
      expect(result).toHaveLength(2);
      expect(result[1].toolCalls).toHaveLength(1);
      expect(result[1].toolCalls![0].name).toBe('my_tool');
    });

    it('drops orphaned tool calls before user message', () => {
      const items: ConversationItem[] = [
        { type: 'mcp_call', id: 'tc1', name: 'tool' },
        { type: 'message', role: 'user', content: 'Hi' },
      ];
      const result = processConversationItems(items, logger);
      expect(result).toHaveLength(1);
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('orphaned tool call'),
      );
    });

    it('processes file_search_call and attaches RAG sources', () => {
      const items: ConversationItem[] = [
        { type: 'message', role: 'user', content: 'Search' },
        {
          type: 'file_search_call',
          id: 'fs1',
          queries: ['q1'],
          results: [
            { filename: 'doc.txt', file_id: 'f1', text: 'chunk', score: 0.9 },
          ],
        },
        { type: 'message', role: 'assistant', content: 'Found it' },
      ];
      const result = processConversationItems(items, logger);
      expect(result).toHaveLength(2);
      expect(result[1].ragSources).toHaveLength(1);
      expect(result[1].ragSources![0].filename).toBe('doc.txt');
      expect(result[1].ragSources![0].fileId).toBe('f1');
    });

    it('adds createdAt from created_at when present', () => {
      const items: ConversationItem[] = [
        {
          type: 'message',
          role: 'user',
          content: 'Hi',
          created_at: 1709107200, // Unix seconds
        },
      ];
      const result = processConversationItems(items, logger);
      expect(result[0].createdAt).toBe(
        new Date(1709107200 * 1000).toISOString(),
      );
    });

    it('skips messages with empty text', () => {
      const items: ConversationItem[] = [
        { type: 'message', role: 'user', content: '   ' },
        { type: 'message', role: 'assistant', content: 'Reply' },
      ];
      const result = processConversationItems(items, logger);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Reply');
    });
  });
});
