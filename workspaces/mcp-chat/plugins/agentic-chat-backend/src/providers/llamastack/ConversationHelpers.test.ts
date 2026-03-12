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
  mapRawItemsToConversationItems,
  mapRawInputItemsToNormalized,
  toConversationSummary,
  createOutputSummaryForLogging,
} from './ConversationHelpers';

describe('ConversationHelpers', () => {
  describe('mapRawItemsToConversationItems', () => {
    it('maps basic message items', () => {
      const raw = [
        {
          type: 'message',
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
        },
      ];
      const result = mapRawItemsToConversationItems(raw);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'message',
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
      });
    });

    it('maps mcp_call with tool fields', () => {
      const raw = [
        {
          type: 'mcp_call',
          id: 'call-1',
          name: 'projects_list',
          server_label: 'ocp-mcp',
          arguments: '{"org":"acme"}',
          output: '{"projects":[]}',
        },
      ];
      const result = mapRawItemsToConversationItems(raw);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'mcp_call',
        name: 'projects_list',
        server_label: 'ocp-mcp',
        arguments: '{"org":"acme"}',
        output: '{"projects":[]}',
      });
    });

    it('maps file_search_call with results', () => {
      const raw = [
        {
          type: 'file_search_call',
          call_id: 'fs-1',
          queries: ['query1'],
          results: [{ filename: 'doc.pdf', text: 'snippet', score: 0.9 }],
        },
      ];
      const result = mapRawItemsToConversationItems(raw);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('file_search_call');
      expect(result[0].queries).toEqual(['query1']);
      expect(result[0].results).toHaveLength(1);
      expect(result[0].results![0]).toMatchObject({
        filename: 'doc.pdf',
        text: 'snippet',
        score: 0.9,
      });
    });

    it('maps created_at timestamp', () => {
      const raw = [
        {
          type: 'message',
          role: 'assistant',
          content: 'Hi',
          created_at: 1700000000,
        },
      ];
      const result = mapRawItemsToConversationItems(raw);
      expect(result[0].created_at).toBe(1700000000);
    });

    it('returns empty array for empty input', () => {
      const result = mapRawItemsToConversationItems([]);
      expect(result).toEqual([]);
    });
  });

  describe('mapRawInputItemsToNormalized', () => {
    it('normalizes content for each item', () => {
      const raw = [
        {
          type: 'message',
          id: 'm1',
          role: 'user',
          content: 'Hello',
          status: 'completed',
        },
      ];
      const result = mapRawInputItemsToNormalized(raw);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'message',
        id: 'm1',
        role: 'user',
        content: 'Hello',
        status: 'completed',
      });
    });

    it('handles array content', () => {
      const raw = [
        {
          type: 'message',
          content: [{ type: 'input_text', text: 'Hi' }],
        },
      ];
      const result = mapRawInputItemsToNormalized(raw);
      expect(result[0].content).toEqual([{ type: 'input_text', text: 'Hi' }]);
    });

    it('returns empty array for empty input', () => {
      const result = mapRawInputItemsToNormalized([]);
      expect(result).toEqual([]);
    });
  });

  describe('toConversationSummary', () => {
    it('builds summary from valid raw item', () => {
      const r = {
        id: 'resp-1',
        model: 'model',
        status: 'completed',
        created_at: 1700000000,
        input: [],
        previous_response_id: undefined,
        conversation: undefined,
      };
      const summary = toConversationSummary(r, 'Preview text', 'conv-123');
      expect(summary).not.toBeNull();
      expect(summary!.responseId).toBe('resp-1');
      expect(summary!.preview).toBe('Preview text');
      expect(summary!.createdAt).toEqual(new Date(1700000000 * 1000));
      expect(summary!.model).toBe('model');
      expect(summary!.status).toBe('completed');
      expect(summary!.conversationId).toBe('conv-123');
    });

    it('uses r.conversation over passed conversationId', () => {
      const r = {
        id: 'resp-1',
        model: 'm',
        status: 'completed',
        created_at: 1700000000,
        conversation: 'from-api',
      };
      const summary = toConversationSummary(r, 'P', 'from-registry');
      expect(summary!.conversationId).toBe('from-api');
    });

    it('returns null when id is missing', () => {
      const r = {
        model: 'm',
        status: 'completed',
        created_at: 1700000000,
      };
      expect(toConversationSummary(r, 'P', undefined)).toBeNull();
    });

    it('returns null when created_at is missing', () => {
      const r = {
        id: 'resp-1',
        model: 'm',
        status: 'completed',
      };
      expect(toConversationSummary(r, 'P', undefined)).toBeNull();
    });

    it('returns null when model is missing', () => {
      const r = {
        id: 'resp-1',
        status: 'completed',
        created_at: 1700000000,
      };
      expect(toConversationSummary(r, 'P', undefined)).toBeNull();
    });
  });

  describe('createOutputSummaryForLogging', () => {
    it('creates compact summary for each output item', () => {
      const output = [
        { type: 'mcp_call', name: 'tool1', output: 'result' },
        { type: 'message', content: [{ type: 'text', text: 'Hi' }] },
      ];
      const result = createOutputSummaryForLogging(output);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        type: 'mcp_call',
        name: 'tool1',
        hasOutput: true,
      });
      expect(result[1]).toMatchObject({
        type: 'message',
        contentParts: 1,
      });
    });

    it('includes error when present', () => {
      const output = [{ type: 'mcp_call', name: 'tool1', error: 'failed' }];
      const result = createOutputSummaryForLogging(output);
      expect(result[0].error).toBe('failed');
    });

    it('returns empty array for empty output', () => {
      const result = createOutputSummaryForLogging([]);
      expect(result).toEqual([]);
    });
  });
});
