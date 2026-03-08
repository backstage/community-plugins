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
  findJsonBlocks,
  stripEchoedToolOutput,
  getFallbackResponseText,
  getEmptyStreamResponseText,
} from './streamingHelpers';

describe('streamingHelpers', () => {
  describe('findJsonBlocks', () => {
    it('finds JSON objects in text', () => {
      const json =
        '{"key": "value", "nested": {"a": 1}, "arr": [1, 2, 3], "pad": "xxxx"}';
      const text = `Some text ${json} more text`;
      const blocks = findJsonBlocks(text);
      expect(blocks).toHaveLength(1);
      expect(text.slice(blocks[0].start, blocks[0].end)).toBe(json);
    });

    it('finds multiple JSON objects', () => {
      const json1 =
        '{"a": 1, "extra": "padding to reach minimum length of 60 chars"}';
      const json2 =
        '{"b": 2, "extra": "padding to reach minimum length of 60 chars"}';
      const text = `${json1} x ${json2}`;
      const blocks = findJsonBlocks(text);
      expect(blocks).toHaveLength(2);
      expect(text.slice(blocks[0].start, blocks[0].end)).toBe(json1);
      expect(text.slice(blocks[1].start, blocks[1].end)).toBe(json2);
    });

    it('ignores JSON blocks shorter than MIN_ECHO_LENGTH (60)', () => {
      const text = 'Short {"x":1}';
      const blocks = findJsonBlocks(text);
      expect(blocks).toHaveLength(0);
    });

    it('handles nested JSON', () => {
      const json =
        '{"outer": {"inner": [1, 2, 3]}, "extra": "padding to reach 60 chars"}';
      const text = `Prefix ${json} suffix`;
      const blocks = findJsonBlocks(text);
      expect(blocks).toHaveLength(1);
      expect(text.slice(blocks[0].start, blocks[0].end)).toBe(json);
    });
  });

  describe('stripEchoedToolOutput', () => {
    it('removes echoed tool output from response', () => {
      const toolOutput =
        '{"result": "success", "data": [1, 2, 3], "nested": {"a": true}, "extra": "padding to reach 60 chars"}';
      const text = `Here is the result:\n\n\`\`\`json\n${toolOutput}\n\`\`\`\n\nDone.`;
      const toolCalls = [
        {
          id: 'tc1',
          type: 'tool',
          status: 'completed',
          output: toolOutput,
        },
      ];

      const result = stripEchoedToolOutput(text, toolCalls);
      expect(result).not.toContain(toolOutput);
      expect(result).toContain('Here is the result');
      expect(result).toContain('Done');
    });

    it('returns original text when no tool calls', () => {
      const text = 'Some text {"key": "value"}';
      expect(stripEchoedToolOutput(text, [])).toBe(text);
    });

    it('returns original text when text is empty', () => {
      expect(
        stripEchoedToolOutput('', [
          { id: '1', type: 't', status: 'ok', output: 'x'.repeat(70) },
        ]),
      ).toBe('');
    });
  });

  describe('getFallbackResponseText', () => {
    it('returns sensible fallback when all tools fail', () => {
      const toolCalls = [
        { id: '1', type: 't', status: 'failed', error: 'err1' },
      ];
      const result = getFallbackResponseText(toolCalls);
      expect(result).toContain('Tool execution failed');
      expect(result).toContain('1 tool');
      expect(result).toContain('encountered errors');
    });

    it('returns fallback when some tools succeed and some fail', () => {
      const toolCalls = [
        { id: '1', type: 't', status: 'completed', output: 'ok' },
        { id: '2', type: 't', status: 'failed', error: 'err' },
      ];
      const result = getFallbackResponseText(toolCalls);
      expect(result).toContain('Executed 1 tool successfully');
      expect(result).toContain('1 failed');
    });

    it('returns success message when all tools complete', () => {
      const toolCalls = [
        { id: '1', type: 't', status: 'completed', output: 'ok' },
      ];
      const result = getFallbackResponseText(toolCalls);
      expect(result).toBe(
        'Tool execution completed successfully. See the results in the tool details below.',
      );
    });

    it('returns generic message when no outputs', () => {
      const result = getFallbackResponseText([]);
      expect(result).toBe(
        'Tool execution completed. No additional response generated.',
      );
    });
  });

  describe('getEmptyStreamResponseText', () => {
    it('returns connection ended message when not completed', () => {
      const result = getEmptyStreamResponseText(false, undefined, undefined);
      expect(result).toBe(
        'The connection ended without a response. Please try again.',
      );
    });

    it('returns model-specific message when 0 output tokens and model name', () => {
      const result = getEmptyStreamResponseText(true, 0, 'llama-3');
      expect(result).toContain('Model "llama-3"');
      expect(result).toContain('0 output tokens');
      expect(result).toContain('Admin Panel');
    });

    it('returns generic 0 tokens message when no model name', () => {
      const result = getEmptyStreamResponseText(true, 0, undefined);
      expect(result).toContain('0 output tokens');
      expect(result).toContain('Admin Panel');
    });

    it('returns configuration issue message when completed but no tokens info', () => {
      const result = getEmptyStreamResponseText(true, undefined, undefined);
      expect(result).toContain('No response received');
      expect(result).toContain('configuration issue');
    });
  });
});
