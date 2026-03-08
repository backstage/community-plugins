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

import { normalizeErrorMessage } from './errors';

describe('normalizeErrorMessage', () => {
  describe('with Error instance', () => {
    it('returns err.message', () => {
      const err = new Error('Something went wrong');
      expect(normalizeErrorMessage(err)).toBe('Something went wrong');
    });

    it('returns empty string for Error with empty message', () => {
      const err = new Error('');
      expect(normalizeErrorMessage(err)).toBe('');
    });
  });

  describe('with string', () => {
    it('returns fallback when provided', () => {
      expect(normalizeErrorMessage('raw string', 'Fallback message')).toBe(
        'Fallback message',
      );
    });

    it('returns String(string) when no fallback', () => {
      expect(normalizeErrorMessage('raw string')).toBe('raw string');
    });
  });

  describe('with null/undefined', () => {
    it('returns fallback when err is null', () => {
      expect(normalizeErrorMessage(null, 'Fallback')).toBe('Fallback');
    });

    it('returns fallback when err is undefined', () => {
      expect(normalizeErrorMessage(undefined, 'Fallback')).toBe('Fallback');
    });

    it('returns "null" when err is null and no fallback', () => {
      expect(normalizeErrorMessage(null)).toBe('null');
    });

    it('returns "undefined" when err is undefined and no fallback', () => {
      expect(normalizeErrorMessage(undefined)).toBe('undefined');
    });
  });

  describe('without fallback', () => {
    it('returns String(err) for non-Error, non-string values', () => {
      expect(normalizeErrorMessage(42)).toBe('42');
      expect(normalizeErrorMessage({ foo: 'bar' })).toBe('[object Object]');
    });
  });
});
