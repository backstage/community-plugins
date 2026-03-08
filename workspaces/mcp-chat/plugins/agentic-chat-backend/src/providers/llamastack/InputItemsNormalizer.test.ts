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

import { normalizeContent } from './InputItemsNormalizer';

describe('normalizeContent', () => {
  describe('string input', () => {
    it('returns string as-is', () => {
      expect(normalizeContent('hello')).toBe('hello');
      expect(normalizeContent('')).toBe('');
    });
  });

  describe('array input', () => {
    it('normalizes array of objects with type and text', () => {
      const input = [
        { type: 'input_text', text: 'hello' },
        { type: 'output_text', text: 'world' },
      ];
      expect(normalizeContent(input)).toEqual([
        { type: 'input_text', text: 'hello' },
        { type: 'output_text', text: 'world' },
      ]);
    });

    it('uses default type "text" when type is missing', () => {
      const input = [{ text: 'hello' }];
      expect(normalizeContent(input)).toEqual([
        { type: 'text', text: 'hello' },
      ]);
    });

    it('omits text when not a string', () => {
      const input = [{ type: 'input_text', text: 123 }];
      expect(normalizeContent(input)).toEqual([
        { type: 'input_text', text: undefined },
      ]);
    });

    it('converts non-object array elements to { type: "text", text: String(c) }', () => {
      const input = ['hello', 42, null];
      expect(normalizeContent(input)).toEqual([
        { type: 'text', text: 'hello' },
        { type: 'text', text: '42' },
        { type: 'text', text: 'null' },
      ]);
    });

    it('handles empty array', () => {
      expect(normalizeContent([])).toEqual([]);
    });

    it('handles mixed object and primitive elements', () => {
      const input = [{ type: 'input_text', text: 'user said' }, 'plain string'];
      expect(normalizeContent(input)).toEqual([
        { type: 'input_text', text: 'user said' },
        { type: 'text', text: 'plain string' },
      ]);
    });

    it('converts null/undefined in object to default type', () => {
      const input = [{ type: null, text: 'ok' }];
      expect(normalizeContent(input)).toEqual([{ type: 'text', text: 'ok' }]);
    });
  });

  describe('edge cases', () => {
    it('returns undefined for null', () => {
      expect(normalizeContent(null)).toBeUndefined();
    });

    it('returns undefined for undefined', () => {
      expect(normalizeContent(undefined)).toBeUndefined();
    });

    it('returns undefined for number', () => {
      expect(normalizeContent(42)).toBeUndefined();
    });

    it('returns undefined for boolean', () => {
      expect(normalizeContent(true)).toBeUndefined();
    });

    it('returns undefined for plain object (not array)', () => {
      expect(normalizeContent({ type: 'text', text: 'hi' })).toBeUndefined();
    });
  });
});
