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

import { InputError, NotAllowedError } from '@backstage/errors';
import { assertPathAllowed, joinSecretPath, normalizePath } from './pathUtils';

describe('pathUtils', () => {
  describe('normalizePath', () => {
    it('returns root for empty input', () => {
      expect(normalizePath('')).toEqual('/');
    });

    it('adds leading slash when missing', () => {
      expect(normalizePath('demo/app')).toEqual('/demo/app');
    });

    it('preserves leading slash', () => {
      expect(normalizePath('/demo/app')).toEqual('/demo/app');
    });
  });

  describe('joinSecretPath', () => {
    it('joins relative names to the context path', () => {
      expect(joinSecretPath('/demo', 'secret')).toEqual('/demo/secret');
    });

    it('accepts full paths as secret names', () => {
      expect(joinSecretPath('/demo', '/other/secret')).toEqual('/other/secret');
    });

    it('rejects empty secret names', () => {
      expect(() => joinSecretPath('/demo', '   ')).toThrow(InputError);
    });
  });

  describe('assertPathAllowed', () => {
    it('allows any path when context is root', () => {
      expect(() => assertPathAllowed('/any/path', '/')).not.toThrow();
    });

    it('allows secrets under the context path', () => {
      expect(() =>
        assertPathAllowed('/demo/app/secret', '/demo/app'),
      ).not.toThrow();
    });

    it('allows the context path itself', () => {
      expect(() => assertPathAllowed('/demo/app', '/demo/app')).not.toThrow();
    });

    it('rejects paths outside the context', () => {
      expect(() => assertPathAllowed('/other/secret', '/demo/app')).toThrow(
        NotAllowedError,
      );
    });
  });
});
