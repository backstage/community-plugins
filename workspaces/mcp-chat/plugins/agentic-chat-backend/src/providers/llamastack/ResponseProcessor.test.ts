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

import { processResponse } from './ResponseProcessor';
import type { ResponsesApiResponse } from '../../types';

function makeResponse(
  overrides: Partial<ResponsesApiResponse> = {},
): ResponsesApiResponse {
  return {
    id: 'resp-1',
    object: 'response',
    created_at: 1234567890,
    model: 'test-model',
    status: 'completed',
    output: [],
    ...overrides,
  };
}

describe('processResponse', () => {
  describe('text content', () => {
    it('extracts text from message output_text content', () => {
      const response = makeResponse({
        output: [
          {
            type: 'message',
            id: 'msg-1',
            role: 'assistant',
            status: 'completed',
            content: [
              { type: 'output_text', text: 'Hello ' },
              { type: 'output_text', text: 'world!' },
            ],
          },
        ],
      });
      const result = processResponse(response);
      expect(result.content).toBe('Hello world!');
      expect(result.role).toBe('assistant');
    });

    it('returns fallback when no text content', () => {
      const response = makeResponse({ output: [] });
      const result = processResponse(response);
      expect(result.content).toBe('I could not generate a response.');
    });

    it('ignores non-output_text content', () => {
      const response = makeResponse({
        output: [
          {
            type: 'message',
            id: 'msg-1',
            role: 'assistant',
            status: 'completed',
            content: [
              { type: 'input_text' as 'output_text', text: 'ignored' },
              { type: 'output_text', text: 'visible' },
            ],
          },
        ],
      });
      const result = processResponse(response);
      expect(result.content).toBe('visible');
    });
  });

  describe('RAG sources (file_search_call)', () => {
    it('extracts RAG sources from file_search_call results', () => {
      const response = makeResponse({
        output: [
          {
            type: 'file_search_call',
            id: 'fs-1',
            status: 'completed',
            queries: ['query'],
            results: [
              {
                file_id: 'file-123',
                filename: 'readme.md',
                score: 0.9,
                text: 'chunk text',
                attributes: {
                  title: 'Readme',
                  source_url: 'https://example.com/readme.md',
                  content_type: 'markdown',
                },
              },
            ],
          },
        ],
      });
      const result = processResponse(response);
      expect(result.ragSources).toHaveLength(1);
      expect(result.ragSources![0]).toEqual({
        filename: 'readme.md',
        fileId: 'file-123',
        score: 0.9,
        text: 'chunk text',
        title: 'Readme',
        sourceUrl: 'https://example.com/readme.md',
        contentType: 'markdown',
        attributes: {
          title: 'Readme',
          source_url: 'https://example.com/readme.md',
          content_type: 'markdown',
        },
      });
    });

    it('deduplicates sources by sourceUrl, file_id, or filename', () => {
      const response = makeResponse({
        output: [
          {
            type: 'file_search_call',
            id: 'fs-1',
            status: 'completed',
            queries: ['query'],
            results: [
              {
                file_id: 'file-1',
                filename: 'a.md',
                score: 0.9,
                text: 'first',
                attributes: { source_url: 'https://example.com/a.md' },
              },
              {
                file_id: 'file-1',
                filename: 'a.md',
                score: 0.8,
                text: 'duplicate',
                attributes: { source_url: 'https://example.com/a.md' },
              },
            ],
          },
        ],
      });
      const result = processResponse(response);
      expect(result.ragSources).toHaveLength(1);
      expect(result.ragSources![0].text).toBe('first');
    });

    it('omits ragSources when empty', () => {
      const response = makeResponse({
        output: [
          {
            type: 'file_search_call',
            id: 'fs-1',
            status: 'completed',
            queries: [],
            results: [],
          },
        ],
      });
      const result = processResponse(response);
      expect(result.ragSources).toBeUndefined();
    });
  });

  describe('tool calls (mcp_call)', () => {
    it('extracts tool calls from mcp_call items', () => {
      const response = makeResponse({
        output: [
          {
            type: 'mcp_call',
            id: 'call-1',
            name: 'search_tools',
            arguments: '{"query":"test"}',
            server_label: 'my-mcp',
            output: 'result',
          },
        ],
      });
      const result = processResponse(response);
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0]).toEqual({
        id: 'call-1',
        name: 'search_tools',
        serverLabel: 'my-mcp',
        arguments: '{"query":"test"}',
        output: 'result',
        error: undefined,
      });
    });

    it('includes error when mcp_call has error', () => {
      const response = makeResponse({
        output: [
          {
            type: 'mcp_call',
            id: 'call-1',
            name: 'failing_tool',
            arguments: '{}',
            server_label: 'mcp',
            error: 'Tool failed',
          },
        ],
      });
      const result = processResponse(response);
      expect(result.toolCalls![0].error).toBe('Tool failed');
    });

    it('uses Unknown tool when name is missing', () => {
      const response = makeResponse({
        output: [
          {
            type: 'mcp_call',
            id: 'call-1',
            name: undefined as unknown as string,
            arguments: '{}',
            server_label: 'mcp',
          },
        ],
      });
      const result = processResponse(response);
      expect(result.toolCalls![0].name).toBe('Unknown tool');
    });

    it('omits toolCalls when empty', () => {
      const response = makeResponse({ output: [] });
      const result = processResponse(response);
      expect(result.toolCalls).toBeUndefined();
    });
  });

  describe('metadata', () => {
    it('passes through responseId and usage', () => {
      const response = makeResponse({
        id: 'resp-xyz',
        usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
      });
      const result = processResponse(response);
      expect(result.responseId).toBe('resp-xyz');
      expect(result.usage).toEqual({
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
      });
    });
  });
});
