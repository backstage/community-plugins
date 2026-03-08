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

import { normalizeLlamaStackEvent } from './EventNormalizer';

describe('normalizeLlamaStackEvent', () => {
  describe('malformed input', () => {
    it('returns empty array for invalid JSON', () => {
      expect(normalizeLlamaStackEvent('not json')).toEqual([]);
    });

    it('returns empty array for empty object', () => {
      expect(normalizeLlamaStackEvent('{}')).toEqual([]);
    });

    it('handles error object without type field', () => {
      const raw = JSON.stringify({ error: { message: 'server crashed' } });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.error', error: 'server crashed' },
      ]);
    });

    it('handles error string without type field', () => {
      const raw = JSON.stringify({ error: 'boom' });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.error', error: 'boom' },
      ]);
    });
  });

  describe('response lifecycle', () => {
    it('normalizes response.created', () => {
      const raw = JSON.stringify({
        type: 'response.created',
        response: { id: 'resp-1', model: 'llama-3' },
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.started', responseId: 'resp-1', model: 'llama-3' },
      ]);
    });

    it('normalizes response.in_progress to empty', () => {
      const raw = JSON.stringify({ type: 'response.in_progress' });
      expect(normalizeLlamaStackEvent(raw)).toEqual([]);
    });

    it('normalizes response.completed with usage', () => {
      const raw = JSON.stringify({
        type: 'response.completed',
        response: {
          id: 'resp-1',
          usage: {
            input_tokens: 100,
            output_tokens: 50,
            total_tokens: 150,
          },
        },
      });
      const result = normalizeLlamaStackEvent(raw);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'stream.completed',
        responseId: 'resp-1',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      });
    });

    it('normalizes response.completed without usage', () => {
      const raw = JSON.stringify({
        type: 'response.completed',
        response: { id: 'resp-1' },
      });
      const result = normalizeLlamaStackEvent(raw);
      expect(result[0]).toMatchObject({
        type: 'stream.completed',
        responseId: 'resp-1',
        usage: undefined,
      });
    });

    it('normalizes response.failed with no details', () => {
      const raw = JSON.stringify({ type: 'response.failed' });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.error', error: 'Response generation failed' },
      ]);
    });

    it('normalizes response.failed with error details', () => {
      const raw = JSON.stringify({
        type: 'response.failed',
        response: {
          error: {
            type: 'server_error',
            message: 'Model returned 0 output tokens',
          },
        },
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.error', error: 'Model returned 0 output tokens' },
      ]);
    });

    it('normalizes error event', () => {
      const raw = JSON.stringify({ type: 'error', message: 'rate limited' });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.error', error: 'rate limited' },
      ]);
    });
  });

  describe('text streaming', () => {
    it('normalizes text delta', () => {
      const raw = JSON.stringify({
        type: 'response.output_text.delta',
        delta: 'Hello',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.text.delta', delta: 'Hello' },
      ]);
    });

    it('ignores text delta with no delta', () => {
      const raw = JSON.stringify({ type: 'response.output_text.delta' });
      expect(normalizeLlamaStackEvent(raw)).toEqual([]);
    });

    it('normalizes text done with part.text', () => {
      const raw = JSON.stringify({
        type: 'response.output_text.done',
        part: { text: 'full response' },
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.text.done', text: 'full response' },
      ]);
    });

    it('normalizes text done with text field', () => {
      const raw = JSON.stringify({
        type: 'response.output_text.done',
        text: 'full response',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.text.done', text: 'full response' },
      ]);
    });
  });

  describe('reasoning/thinking', () => {
    it('normalizes reasoning delta', () => {
      const raw = JSON.stringify({
        type: 'response.reasoning_text.delta',
        delta: 'thinking...',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.reasoning.delta', delta: 'thinking...' },
      ]);
    });

    it('normalizes reasoning done', () => {
      const raw = JSON.stringify({
        type: 'response.reasoning_text.done',
        text: 'I concluded that...',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.reasoning.done', text: 'I concluded that...' },
      ]);
    });
  });

  describe('tool calls', () => {
    it('normalizes MCP tool started via output_item.added', () => {
      const raw = JSON.stringify({
        type: 'response.output_item.added',
        item: {
          id: 'call-1',
          type: 'mcp_call',
          name: 'search_docs',
          server_label: 'my-server',
        },
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.started',
          callId: 'call-1',
          name: 'search_docs',
          serverLabel: 'my-server',
        },
      ]);
    });

    it('normalizes function call started via output_item.added', () => {
      const raw = JSON.stringify({
        type: 'response.output_item.added',
        item: { id: 'call-2', type: 'function_call', name: 'get_weather' },
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.started',
          callId: 'call-2',
          name: 'get_weather',
          serverLabel: undefined,
        },
      ]);
    });

    it('normalizes tool arguments delta', () => {
      const raw = JSON.stringify({
        type: 'response.function_call_arguments.delta',
        item_id: 'call-1',
        delta: '{"query":',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.tool.delta', callId: 'call-1', delta: '{"query":' },
      ]);
    });

    it('normalizes MCP call arguments delta', () => {
      const raw = JSON.stringify({
        type: 'response.mcp_call.arguments.delta',
        item_id: 'call-1',
        delta: '"test"}',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        { type: 'stream.tool.delta', callId: 'call-1', delta: '"test"}' },
      ]);
    });

    it('normalizes MCP call completed', () => {
      const raw = JSON.stringify({
        type: 'response.mcp_call.completed',
        item_id: 'call-1',
        name: 'search_docs',
        server_label: 'my-server',
        output: '{"results": []}',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.completed',
          callId: 'call-1',
          name: 'search_docs',
          serverLabel: 'my-server',
          output: '{"results": []}',
        },
      ]);
    });

    it('normalizes MCP call failed', () => {
      const raw = JSON.stringify({
        type: 'response.mcp_call.failed',
        item_id: 'call-1',
        name: 'search_docs',
        error: 'timeout',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.failed',
          callId: 'call-1',
          name: 'search_docs',
          serverLabel: undefined,
          error: 'timeout',
        },
      ]);
    });

    it('normalizes MCP call requires approval', () => {
      const raw = JSON.stringify({
        type: 'response.mcp_call.requires_approval',
        item_id: 'call-1',
        name: 'delete_file',
        server_label: 'my-server',
        arguments: '{"path": "/tmp/x"}',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.approval',
          callId: 'call-1',
          name: 'delete_file',
          serverLabel: 'my-server',
          arguments: '{"path": "/tmp/x"}',
        },
      ]);
    });

    it('normalizes tool completed via output_item.done', () => {
      const raw = JSON.stringify({
        type: 'response.output_item.done',
        item: {
          id: 'call-1',
          type: 'mcp_call',
          name: 'tool',
          output: 'result',
        },
      });
      const result = normalizeLlamaStackEvent(raw);
      expect(result).toEqual([
        {
          type: 'stream.tool.completed',
          callId: 'call-1',
          name: 'tool',
          serverLabel: undefined,
          output: 'result',
        },
      ]);
    });

    it('normalizes tool failed via output_item.done', () => {
      const raw = JSON.stringify({
        type: 'response.output_item.done',
        item: {
          id: 'call-1',
          type: 'function_call',
          name: 'tool',
          error: 'crashed',
        },
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.failed',
          callId: 'call-1',
          name: 'tool',
          serverLabel: undefined,
          error: 'crashed',
        },
      ]);
    });
  });

  describe('RAG / file search', () => {
    it('normalizes file search results from output_item.done', () => {
      const raw = JSON.stringify({
        type: 'response.output_item.done',
        item: {
          type: 'file_search_call',
          results: [
            {
              filename: 'doc.md',
              file_id: 'f-1',
              text: 'relevant text',
              score: 0.95,
              attributes: {
                title: 'My Doc',
                source_url: 'https://example.com',
              },
            },
          ],
        },
      });
      const result = normalizeLlamaStackEvent(raw);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'stream.rag.results',
        sources: [
          {
            filename: 'doc.md',
            fileId: 'f-1',
            text: 'relevant text',
            score: 0.95,
            title: 'My Doc',
            sourceUrl: 'https://example.com',
          },
        ],
        filesSearched: ['doc.md'],
      });
    });
  });

  describe('MCP tool discovery', () => {
    it('normalizes mcp_list_tools in_progress', () => {
      const raw = JSON.stringify({
        type: 'response.mcp_list_tools.in_progress',
        server_label: 'my-server',
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.discovery',
          serverLabel: 'my-server',
          status: 'in_progress',
        },
      ]);
    });

    it('normalizes mcp_list_tools completed', () => {
      const raw = JSON.stringify({
        type: 'response.mcp_list_tools.completed',
        server_label: 'my-server',
        tool_count: 5,
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.discovery',
          serverLabel: 'my-server',
          status: 'completed',
          toolCount: 5,
        },
      ]);
    });
  });

  describe('unknown events', () => {
    it('returns empty for unrecognized event types', () => {
      const raw = JSON.stringify({ type: 'response.some_future_event' });
      expect(normalizeLlamaStackEvent(raw)).toEqual([]);
    });
  });

  describe('approval via output_item.added', () => {
    it('normalizes mcp_approval_request item', () => {
      const raw = JSON.stringify({
        type: 'response.output_item.added',
        item: {
          id: 'approve-1',
          type: 'mcp_approval_request',
          name: 'delete_db',
          server_label: 'my-server',
          arguments: '{"table": "users"}',
        },
      });
      expect(normalizeLlamaStackEvent(raw)).toEqual([
        {
          type: 'stream.tool.approval',
          callId: 'approve-1',
          name: 'delete_db',
          serverLabel: 'my-server',
          arguments: '{"table": "users"}',
        },
      ]);
    });
  });
});
