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

import { sanitizeResponseText } from './sanitize';

describe('sanitizeResponseText', () => {
  it('should return empty string for empty input', () => {
    expect(sanitizeResponseText('')).toBe('');
  });

  it('should return undefined/null as-is', () => {
    // @ts-ignore testing runtime behavior with invalid input
    expect(sanitizeResponseText(undefined)).toBe(undefined);
    // @ts-ignore testing runtime behavior with invalid input
    expect(sanitizeResponseText(null)).toBe(null);
  });

  it('should remove file reference tokens', () => {
    const input =
      'Some text <|file-3bf6634762184a15900d7d568264430a|> more text';
    const expected = 'Some text  more text';
    expect(sanitizeResponseText(input)).toBe(expected);
  });

  it('should remove multiple file reference tokens', () => {
    const input =
      '<|file-abc123|> start <|file-def456789|> middle <|file-000|> end';
    const expected = 'start  middle  end';
    expect(sanitizeResponseText(input)).toBe(expected);
  });

  it('should handle uppercase hex in file tokens', () => {
    const input = 'Text <|file-ABCDEF123456|> here';
    const expected = 'Text  here';
    expect(sanitizeResponseText(input)).toBe(expected);
  });

  it('should handle mixed case hex in file tokens', () => {
    const input = 'Text <|file-AbCdEf123456|> here';
    const expected = 'Text  here';
    expect(sanitizeResponseText(input)).toBe(expected);
  });

  it('should preserve text without file tokens', () => {
    const input = 'This is normal text without any tokens.';
    expect(sanitizeResponseText(input)).toBe(input);
  });

  it('should preserve markdown content', () => {
    const input = '# Header\n\n**Bold** and *italic* text\n\n- List item';
    expect(sanitizeResponseText(input)).toBe(input);
  });

  it('should preserve code blocks', () => {
    const input = '```typescript\nconst x = 1;\n```';
    expect(sanitizeResponseText(input)).toBe(input);
  });

  it('should not remove similar but invalid tokens', () => {
    // These should NOT be removed as they don't match the pattern
    const inputs = [
      '<|file-|>', // empty hex
      '<|file-xyz|>', // non-hex characters (contains xyz which are not hex)
      '<file-abc123>', // missing pipe
      '|file-abc123|', // missing angle brackets
    ];

    inputs.forEach(input => {
      expect(sanitizeResponseText(input)).toBe(input);
    });
  });

  it('should match case-insensitively (uppercase FILE is also matched)', () => {
    // The regex is case-insensitive, so uppercase variants are removed
    const input = 'Text <|FILE-ABC123|> here';
    const expected = 'Text  here';
    expect(sanitizeResponseText(input)).toBe(expected);
  });

  it('should handle file tokens at start of text', () => {
    const input = '<|file-abc123|>Starting text';
    expect(sanitizeResponseText(input)).toBe('Starting text');
  });

  it('should handle file tokens at end of text', () => {
    const input = 'Ending text<|file-abc123|>';
    expect(sanitizeResponseText(input)).toBe('Ending text');
  });

  it('should handle consecutive file tokens', () => {
    const input = '<|file-aaa|><|file-bbb|><|file-ccc|>';
    expect(sanitizeResponseText(input)).toBe('');
  });

  it('should strip [Execute ... tool with ...] patterns', () => {
    const input =
      '[Execute rag_search tool with query "what is a dog"]\nA dog is a domesticated mammal.';
    expect(sanitizeResponseText(input)).toBe('A dog is a domesticated mammal.');
  });

  it('should strip short [Execute tool_name] patterns', () => {
    const input = '[Execute meadow_tool]\nMeadow is an operator.';
    expect(sanitizeResponseText(input)).toBe('Meadow is an operator.');
  });

  it('should strip [tool_name(args)] patterns', () => {
    const input =
      '[rag_search(query="what is a dog")]\nA dog is a domesticated mammal.';
    expect(sanitizeResponseText(input)).toBe('A dog is a domesticated mammal.');
  });

  it('should strip standalone [tool_name] patterns (snake_case)', () => {
    const input = '[knowledge_base_search]\nSome answer here.';
    expect(sanitizeResponseText(input)).toBe('Some answer here.');
  });

  it('should NOT strip single-word brackets (could be markdown)', () => {
    const input = 'See [reference] for more info.';
    expect(sanitizeResponseText(input)).toBe('See [reference] for more info.');
  });

  it('should NOT strip markdown links', () => {
    const input = 'Click [here](https://example.com) for details.';
    expect(sanitizeResponseText(input)).toBe(
      'Click [here](https://example.com) for details.',
    );
  });

  it('should strip tool call text case-insensitively', () => {
    const input =
      '[EXECUTE knowledge_search tool with query "test"]\nResult here.';
    expect(sanitizeResponseText(input)).toBe('Result here.');
  });

  it('should handle tool text mixed with file tokens', () => {
    const input =
      '[Execute rag_search tool with query "test"]\n<|file-abc123|>Some answer';
    expect(sanitizeResponseText(input)).toBe('Some answer');
  });
});
