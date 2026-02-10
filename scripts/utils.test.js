/*
 * Copyright 2026 The Backstage Authors
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
import assert from 'node:assert/strict';
import { before, describe, it, mock } from 'node:test';
import path from 'node:path';

import { asyncFilter, safeJsonRead } from './utils.js';

describe('utils', () => {
  describe('async-filter', () => {
    it('should be defined', () => {
      assert.equal(typeof asyncFilter, 'function');
      assert.equal(asyncFilter.length, 2);
    });

    [[[0, 1, 2, 3], [1, 2, 3], x => Promise.resolve(x)]].forEach(
      ([input, expected, fn]) => {
        it(`should filter array contents: ${input}`, async () => {
          assert.deepEqual(await asyncFilter(input, fn), expected);
        });
      },
    );

    it('should reject if any promise rejects', async () => {
      await assert.rejects(asyncFilter([1, 2], x => Promise.reject(x)));
    });
  });

  describe('safe-json-read', () => {
    before(() => {
      // mocked solely to keep test output tidy
      mock.method(console, 'warn', () => {});
    });

    it('should be defined', () => {
      assert.equal(typeof safeJsonRead, 'function');
      assert.equal(safeJsonRead.length, 1);
    });

    ['../package.json', '../workspaces/noop/package.json'].forEach(filename => {
      it(`should read JSON files: ${filename}`, async () => {
        assert.deepEqual(
          await safeJsonRead(path.resolve(filename)),
          await import(filename, { with: { type: 'json' } }).default,
        );
      });
    });

    ['i-dont-exist.good-luck', '../README.md', '../scripts'].forEach(
      filename => {
        it(`should safely fail on bad files: ${filename}`, async () => {
          assert.equal(await safeJsonRead(path.resolve(filename)), undefined);
        });
      },
    );
  });
});
