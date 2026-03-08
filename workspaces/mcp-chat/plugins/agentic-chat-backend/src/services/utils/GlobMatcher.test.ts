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

import { matchesPatterns } from './GlobMatcher';

describe('matchesPatterns', () => {
  describe('simple wildcards (*.ts)', () => {
    it('matches *.ts for file in current directory', () => {
      expect(matchesPatterns('foo.ts', ['*.ts'])).toBe(true);
      expect(matchesPatterns('index.ts', ['*.ts'])).toBe(true);
    });

    it('does not match *.ts for file in subdirectory', () => {
      expect(matchesPatterns('src/foo.ts', ['*.ts'])).toBe(false);
      expect(matchesPatterns('a/b/index.ts', ['*.ts'])).toBe(false);
    });

    it('does not match *.ts for different extension', () => {
      expect(matchesPatterns('foo.js', ['*.ts'])).toBe(false);
      expect(matchesPatterns('foo.md', ['*.ts'])).toBe(false);
    });
  });

  describe('double-star patterns (**/*.ts)', () => {
    it('matches **/*.ts for any path ending in .ts', () => {
      expect(matchesPatterns('src/foo.ts', ['**/*.ts'])).toBe(true);
      expect(matchesPatterns('a/b/c/index.ts', ['**/*.ts'])).toBe(true);
      expect(matchesPatterns('foo.ts', ['**/*.ts'])).toBe(true);
    });

    it('does not match **/*.ts for non-.ts files', () => {
      expect(matchesPatterns('src/foo.js', ['**/*.ts'])).toBe(false);
      expect(matchesPatterns('src/foo.md', ['**/*.ts'])).toBe(false);
    });
  });

  describe('directory patterns (src/**)', () => {
    it('matches src/** for paths under src', () => {
      expect(matchesPatterns('src/index.ts', ['src/**'])).toBe(true);
      expect(matchesPatterns('src/utils/helper.ts', ['src/**'])).toBe(true);
      expect(matchesPatterns('src/a/b/c/file.ts', ['src/**'])).toBe(true);
    });

    it('does not match src/** for paths outside src', () => {
      expect(matchesPatterns('lib/index.ts', ['src/**'])).toBe(false);
      expect(matchesPatterns('index.ts', ['src/**'])).toBe(false);
    });
  });

  describe('returns false when no patterns match', () => {
    it('returns false when path matches none of the patterns', () => {
      expect(matchesPatterns('foo.txt', ['*.ts', '*.js'])).toBe(false);
      expect(matchesPatterns('docs/readme.md', ['src/**', '*.ts'])).toBe(false);
    });
  });

  describe('handles empty patterns array', () => {
    it('returns false for empty patterns', () => {
      expect(matchesPatterns('foo.ts', [])).toBe(false);
      expect(matchesPatterns('any/path/file.txt', [])).toBe(false);
    });
  });

  describe('pattern matching behavior', () => {
    it('returns true when any pattern matches', () => {
      expect(matchesPatterns('foo.ts', ['*.js', '*.ts', '*.md'])).toBe(true);
      expect(matchesPatterns('src/bar.ts', ['*.ts', '**/*.ts'])).toBe(true);
    });

    it('normalizes backslashes to forward slashes', () => {
      expect(matchesPatterns('src\\foo\\bar.ts', ['**/*.ts'])).toBe(true);
    });

    it('matches ? wildcard for single character', () => {
      expect(matchesPatterns('a.ts', ['?.ts'])).toBe(true);
      expect(matchesPatterns('ab.ts', ['?.ts'])).toBe(false);
    });

    it('matches * for any characters in filename', () => {
      expect(matchesPatterns('my-component.tsx', ['*.tsx'])).toBe(true);
    });
  });
});
