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

import { formatResponseText, formatToolOutput } from './formatResponse';

describe('formatResponseText', () => {
  it('should return empty string for empty input', () => {
    expect(formatResponseText('')).toBe('');
  });

  it('should return undefined/null as-is', () => {
    expect(formatResponseText(undefined as unknown as string)).toBe(undefined);
    expect(formatResponseText(null as unknown as string)).toBe(null);
  });

  it('should preserve simple text', () => {
    const input = 'Hello, this is a simple response.';
    expect(formatResponseText(input)).toBe(input);
  });

  it('should preserve markdown formatting', () => {
    const input = '# Header\n\n**Bold** and *italic*\n\n- List item';
    expect(formatResponseText(input)).toBe(input);
  });

  describe('JSON formatting', () => {
    it('should format valid JSON objects', () => {
      const input = 'Here is the data: {"name":"test","value":123}';
      const result = formatResponseText(input);
      expect(result).toContain('```json');
      expect(result).toContain('"name": "test"');
    });

    it('should format valid JSON arrays', () => {
      const input = 'List: ["item1","item2","item3"]';
      const result = formatResponseText(input);
      expect(result).toContain('```json');
    });

    it('should skip empty JSON arrays', () => {
      const input = 'Empty array: []';
      expect(formatResponseText(input)).toBe(input);
    });

    it('should skip empty JSON objects', () => {
      const input = 'Empty object: {}';
      expect(formatResponseText(input)).toBe(input);
    });

    it('should not format invalid JSON', () => {
      const input = 'Invalid: {name: "test"}'; // missing quotes on key
      expect(formatResponseText(input)).toBe(input);
    });
  });

  describe('comma-separated list formatting', () => {
    it('should format long comma-separated lists as bullet points', () => {
      const input = 'items: a, b, c, d, e, f, g';
      const result = formatResponseText(input);
      expect(result).toContain('- a');
      expect(result).toContain('- g');
    });

    it('should not format short comma-separated lists', () => {
      const input = 'items: a, b, c';
      expect(formatResponseText(input)).toBe(input);
    });
  });

  describe('key-value formatting', () => {
    it('should format multiple key-value pairs as bold labels', () => {
      const input = 'name: John\nage: 30\ncity: NYC\nrole: Developer';
      const result = formatResponseText(input);
      expect(result).toContain('**name:**');
      expect(result).toContain('**age:**');
    });

    it('should not format when less than 3 key-value pairs', () => {
      const input = 'name: John\nage: 30';
      expect(formatResponseText(input)).toBe(input);
    });
  });

  describe('log block formatting', () => {
    it('should wrap log lines in code blocks', () => {
      const input = `Starting process
I1216 10:30:15.123456 controller.go:248] Processing request
I1216 10:30:15.123457 controller.go:249] Request completed
I1216 10:30:15.123458 controller.go:250] Cleanup done
Done`;
      const result = formatResponseText(input);
      expect(result).toContain('```text');
      expect(result).toContain('```');
    });
  });
});

describe('formatToolOutput', () => {
  it('should return empty string for empty input', () => {
    expect(formatToolOutput('')).toBe('');
  });

  it('should return undefined/null as-is', () => {
    expect(formatToolOutput(undefined as unknown as string)).toBe(undefined);
    expect(formatToolOutput(null as unknown as string)).toBe(null);
  });

  describe('JSON array of strings', () => {
    it('should format short arrays as bullet list', () => {
      const input = JSON.stringify(['item1', 'item2', 'item3']);
      const result = formatToolOutput(input);
      expect(result).toBe('- item1\n- item2\n- item3');
    });

    it('should truncate long arrays', () => {
      const items = Array.from({ length: 15 }, (_, i) => `item${i + 1}`);
      const input = JSON.stringify(items);
      const result = formatToolOutput(input);
      expect(result).toContain('- item1');
      expect(result).toContain('more items');
      expect(result).toContain('- item15');
    });
  });

  describe('JSON array of objects', () => {
    it('should format small objects as markdown table', () => {
      const input = JSON.stringify([
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]);
      const result = formatToolOutput(input);
      expect(result).toContain('| name | age |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| John | 30 |');
    });

    it('should truncate tables with many rows', () => {
      const items = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `item${i}`,
      }));
      const input = JSON.stringify(items);
      const result = formatToolOutput(input);
      expect(result).toContain('more rows');
    });
  });

  describe('JSON objects', () => {
    it('should pretty-print JSON objects', () => {
      const input = JSON.stringify({ name: 'test', nested: { value: 123 } });
      const result = formatToolOutput(input);
      expect(result).toContain('"name": "test"');
      expect(result).toContain('"nested"');
    });
  });

  describe('non-JSON content', () => {
    it('should format long comma-separated values as list', () => {
      const input = 'item1, item2, item3, item4, item5, item6';
      const result = formatToolOutput(input);
      expect(result).toContain('- item1');
      expect(result).toContain('- item6');
    });

    it('should return plain text as-is', () => {
      const input = 'This is just plain text output';
      expect(formatToolOutput(input)).toBe(input);
    });
  });
});
