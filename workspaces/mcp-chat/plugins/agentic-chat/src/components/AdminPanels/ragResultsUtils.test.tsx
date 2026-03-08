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

import { render } from '@testing-library/react';
import { createTheme } from '@mui/material/styles';
import {
  getScoreColor,
  getScoreLabel,
  highlightQueryTerms,
} from './ragResultsUtils';

const theme = createTheme();

describe('ragResultsUtils', () => {
  describe('getScoreColor', () => {
    it('returns success color for high scores (>= 0.7)', () => {
      expect(getScoreColor(0.7, theme)).toBe(theme.palette.success.main);
      expect(getScoreColor(0.8, theme)).toBe(theme.palette.success.main);
      expect(getScoreColor(1, theme)).toBe(theme.palette.success.main);
    });

    it('returns warning color for medium scores (>= 0.4 and < 0.7)', () => {
      expect(getScoreColor(0.4, theme)).toBe(theme.palette.warning.main);
      expect(getScoreColor(0.5, theme)).toBe(theme.palette.warning.main);
      expect(getScoreColor(0.69, theme)).toBe(theme.palette.warning.main);
    });

    it('returns error color for low scores (< 0.4)', () => {
      expect(getScoreColor(0, theme)).toBe(theme.palette.error.main);
      expect(getScoreColor(0.2, theme)).toBe(theme.palette.error.main);
      expect(getScoreColor(0.39, theme)).toBe(theme.palette.error.main);
    });

    it('handles boundary values', () => {
      expect(getScoreColor(0.699999, theme)).toBe(theme.palette.warning.main);
      expect(getScoreColor(0.400001, theme)).toBe(theme.palette.warning.main);
    });
  });

  describe('getScoreLabel', () => {
    it('returns "High" for scores >= 0.7', () => {
      expect(getScoreLabel(0.7)).toBe('High');
      expect(getScoreLabel(0.9)).toBe('High');
      expect(getScoreLabel(1)).toBe('High');
    });

    it('returns "Medium" for scores >= 0.4 and < 0.7', () => {
      expect(getScoreLabel(0.4)).toBe('Medium');
      expect(getScoreLabel(0.55)).toBe('Medium');
      expect(getScoreLabel(0.69)).toBe('Medium');
    });

    it('returns "Low" for scores < 0.4', () => {
      expect(getScoreLabel(0)).toBe('Low');
      expect(getScoreLabel(0.2)).toBe('Low');
      expect(getScoreLabel(0.39)).toBe('Low');
    });

    it('handles boundary values', () => {
      expect(getScoreLabel(0.699999)).toBe('Medium');
      expect(getScoreLabel(0.400001)).toBe('Medium');
    });
  });

  describe('highlightQueryTerms', () => {
    it('returns text as single element when query is empty', () => {
      const result = highlightQueryTerms('Hello world', '', '#ffff00');
      expect(result).toEqual(['Hello world']);
    });

    it('returns text as single element when query is only whitespace', () => {
      const result = highlightQueryTerms('Hello world', '   ', '#ffff00');
      expect(result).toEqual(['Hello world']);
    });

    it('returns text as single element when all query words are <= 2 chars', () => {
      const result = highlightQueryTerms('Hello world', 'a be', '#ffff00');
      expect(result).toEqual(['Hello world']);
    });

    it('highlights matching words in text', () => {
      const result = highlightQueryTerms(
        'The quick brown fox',
        'quick fox',
        '#ffff00',
      );
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('The quick brown fox');
      expect(container.querySelectorAll('mark')).toHaveLength(2);
    });

    it('handles case-insensitive matching', () => {
      const result = highlightQueryTerms('Hello WORLD', 'world', '#ffff00');
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('Hello WORLD');
      expect(container.querySelectorAll('mark')).toHaveLength(1);
    });

    it('handles multiple occurrences of same word', () => {
      const result = highlightQueryTerms('test test test', 'test', '#ffff00');
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('test test test');
      expect(container.querySelectorAll('mark')).toHaveLength(3);
    });

    it('handles query with special regex characters', () => {
      const result = highlightQueryTerms(
        'Price is $10.00 (approx)',
        '$10.00 (approx)',
        '#ffff00',
      );
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('Price is $10.00 (approx)');
    });

    it('filters out short words from query', () => {
      const result = highlightQueryTerms('Hello world', 'He wo', '#ffff00');
      // "He" and "wo" are <= 2 chars, so no highlighting
      expect(result).toEqual(['Hello world']);
    });

    it('uses words longer than 2 chars for highlighting', () => {
      const result = highlightQueryTerms('Hello world', 'Hel world', '#ffff00');
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('Hello world');
      expect(container.querySelectorAll('mark')).toHaveLength(2);
    });

    it('handles text with no matches', () => {
      const result = highlightQueryTerms(
        'Completely different text',
        'nomatch',
        '#ffff00',
      );
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('Completely different text');
      expect(container.querySelectorAll('mark')).toHaveLength(0);
    });

    it('handles empty text', () => {
      const result = highlightQueryTerms('', 'query', '#ffff00');
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('');
    });

    it('handles single matching word', () => {
      const result = highlightQueryTerms('Only one match', 'only', '#ffff00');
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe('Only one match');
      expect(container.querySelectorAll('mark')).toHaveLength(1);
    });
  });
});
