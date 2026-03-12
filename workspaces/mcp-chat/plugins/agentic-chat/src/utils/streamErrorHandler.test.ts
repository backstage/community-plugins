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

import { handleStreamError } from './streamErrorHandler';

describe('handleStreamError', () => {
  const mountedRef = { current: true };
  const unmountedRef = { current: false };
  const abortControllerRef = { current: new AbortController() };

  describe('ignored errors (returns undefined)', () => {
    it('returns undefined for AbortError (user cancelled)', () => {
      const err = new DOMException('The operation was aborted', 'AbortError');
      expect(
        handleStreamError(err, abortControllerRef, mountedRef),
      ).toBeUndefined();
    });

    it('returns undefined when component is unmounted', () => {
      const err = new Error('Network failed');
      expect(
        handleStreamError(err, abortControllerRef, unmountedRef),
      ).toBeUndefined();
    });

    it('returns undefined for AbortError even when unmounted', () => {
      const err = new DOMException('Aborted', 'AbortError');
      expect(
        handleStreamError(err, abortControllerRef, unmountedRef),
      ).toBeUndefined();
    });
  });

  describe('Error instances (returns formatted message)', () => {
    it('returns "Error: <message>" for standard Error', () => {
      const err = new Error('Something went wrong');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Something went wrong',
      );
    });

    it('returns formatted message for network-like errors', () => {
      const err = new Error('Failed to fetch');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Failed to fetch',
      );
    });

    it('returns formatted message for timeout errors', () => {
      const err = new Error('Request timeout');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Request timeout',
      );
    });

    it('returns formatted message for auth errors', () => {
      const err = new Error('Unauthorized: Invalid token');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Unauthorized: Invalid token',
      );
    });

    it('returns formatted message for server errors', () => {
      const err = new Error('Internal Server Error');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Internal Server Error',
      );
    });

    it('handles Error with empty message', () => {
      const err = new Error('');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: ',
      );
    });

    it('handles custom Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      const err = new CustomError('Custom failure');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Custom failure',
      );
    });
  });

  describe('non-Error values (returns generic message)', () => {
    it('returns generic message for string', () => {
      expect(
        handleStreamError('raw string error', abortControllerRef, mountedRef),
      ).toBe('An unexpected error occurred.');
    });

    it('returns generic message for null', () => {
      expect(handleStreamError(null, abortControllerRef, mountedRef)).toBe(
        'An unexpected error occurred.',
      );
    });

    it('returns generic message for undefined', () => {
      expect(handleStreamError(undefined, abortControllerRef, mountedRef)).toBe(
        'An unexpected error occurred.',
      );
    });

    it('returns generic message for number', () => {
      expect(handleStreamError(500, abortControllerRef, mountedRef)).toBe(
        'An unexpected error occurred.',
      );
    });

    it('returns generic message for plain object', () => {
      expect(
        handleStreamError(
          { code: 'ERR_NETWORK' },
          abortControllerRef,
          mountedRef,
        ),
      ).toBe('An unexpected error occurred.');
    });
  });

  describe('DOMException (non-AbortError)', () => {
    it('returns formatted message for DOMException (extends Error)', () => {
      const err = new DOMException('Quota exceeded', 'QuotaExceededError');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Quota exceeded',
      );
    });

    it('returns formatted message for NetworkError DOMException', () => {
      const err = new DOMException('Network error', 'NetworkError');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Network error',
      );
    });

    it('returns formatted message for TimeoutError DOMException', () => {
      const err = new DOMException('Operation timed out', 'TimeoutError');
      expect(handleStreamError(err, abortControllerRef, mountedRef)).toBe(
        'Error: Operation timed out',
      );
    });
  });

  describe('abortControllerRef usage', () => {
    it('does not use abortControllerRef for decision (only mountedRef and err)', () => {
      const err = new Error('Test');
      const nullAbortRef = { current: null };
      expect(handleStreamError(err, nullAbortRef, mountedRef)).toBe(
        'Error: Test',
      );
    });
  });
});
