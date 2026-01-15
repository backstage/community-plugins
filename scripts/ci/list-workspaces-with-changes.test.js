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
import { afterEach, before, describe, it, mock } from 'node:test';

import fs from 'node:fs/promises';

describe('list-workspaces-with-changes', () => {
  const expectedWorkspaces = ['noop', 'foobar', 'catpants', 'baz'];
  const GITHUB_OUTPUT = '/dev/null';
  const mockExecFile = mock.fn((_, __, ___, fn) => {
    fn(null, {
      stdout: [
        ...expectedWorkspaces.map(name => `workspaces/${name}/`),
        'workspaces/no-package.json/',
        'trash/here',
        'workspaces/another-one/',
        'other/junk',
        'things',
        'stuff',
      ].join('\n'),
    });
  });
  let listWorkspacesWithChanges;

  before(() => {
    // mocked solely to keep the console tidy
    mock.method(console, 'log', () => {});

    mock.module('child_process', {
      namedExports: {
        execFile: mockExecFile,
      },
    });

    mock.method(fs, 'appendFile', () => {});
    mock.method(fs, 'stat', path =>
      Promise.resolve(expectedWorkspaces.includes(path.split('/')[1])),
    );
  });

  afterEach(() => {
    [fs.appendFile, fs.stat, mockExecFile].forEach(mockFn => {
      mockFn.mock.resetCalls();
    });
  });

  [
    ['BASE_REF', { BASE_REF: 'most-based-of-refs' }, 'most-based-of-refs...'],
    [
      'COMMIT_SHA_BEFORE',
      { COMMIT_SHA_BEFORE: 'real-commit-sha' },
      'real-commit-sha',
    ],
  ].forEach(([label, env, expected], index) => {
    describe(`with ${label}`, () => {
      before(async () => {
        mock.property(process, 'env', {
          ...env,
          // required by script
          GITHUB_OUTPUT,
        });

        ({ main: listWorkspacesWithChanges } = await import(
          `./list-workspaces-with-changes.js?bust-cache=${index}`
        ));
      });

      it(`should pass ${label} to git diff`, async () => {
        await listWorkspacesWithChanges();

        assert.equal(mockExecFile.mock.callCount(), 1);
        const args = mockExecFile.mock.calls[0].arguments;
        assert.equal(args.length, 4);
        // the last argument is the generated callback so don't check it
        assert.deepEqual(args.slice(0, 3), [
          'git',
          ['diff', '--name-only', expected],
          { shell: true },
        ]);
      });

      it('should append changed workspaces to GITHUB_OUTPUT', async () => {
        await listWorkspacesWithChanges();

        assert.equal(fs.appendFile.mock.callCount(), 1);
        assert.deepEqual(fs.appendFile.mock.calls[0].arguments, [
          GITHUB_OUTPUT,
          `workspaces=${JSON.stringify(expectedWorkspaces)}\n`,
        ]);
      });
    });
  });
});
