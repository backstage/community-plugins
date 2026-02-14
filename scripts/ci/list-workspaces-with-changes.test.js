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
import path from 'node:path';

describe('list-workspaces-with-changes', () => {
  const expectedWorkspaces = ['noop', 'foobar', 'catpants', 'baz'];
  const GITHUB_OUTPUT = '/dev/null';
  const stdoutArray = [
    ...expectedWorkspaces.map(name => `workspaces/${name}/`),
    'workspaces/no-package.json/',
    'trash/here',
    'workspaces/another-one/',
    'other/junk',
    'things',
    'stuff',
  ];
  const mockExecFile = mock.fn((_, __, ___, fn) => {
    fn(null, {
      stdout: stdoutArray.join('\n'),
    });
  });
  const mockAppendFile = mock.fn();
  const mockReadFile = mock.fn();
  const mockStat = mock.fn(filename =>
    Promise.resolve(expectedWorkspaces.includes(filename.split('/')[1])),
  );
  let listWorkspacesWithChanges;

  before(() => {
    // mocked solely to keep the console tidy
    mock.method(console, 'log', () => {});

    mock.module('child_process', {
      namedExports: {
        execFile: mockExecFile,
      },
    });

    mock.module('fs/promises', {
      namedExports: {
        appendFile: mockAppendFile,
        readFile: mockReadFile,
        stat: mockStat,
      },
    });
  });

  afterEach(() => {
    [mockAppendFile, mockExecFile, mockReadFile, mockStat].forEach(mockFn => {
      mockFn.mock.resetCalls();
    });
  });

  [
    [{ BASE_REF: 'most-based-of-refs' }, 'most-based-of-refs...'],
    [{ COMMIT_SHA_BEFORE: 'real-commit-sha' }, 'real-commit-sha'],
  ].forEach(([env, expected], index) => {
    const label = Object.keys(env)[0];

    describe(`with ${label}`, () => {
      before(async () => {
        mock.property(process, 'env', {
          ...env,
          // required by script
          GITHUB_OUTPUT,
        });
        mockReadFile.mock.mockImplementation(async () =>
          JSON.stringify({ engines: { node: '20 || 22' } }),
        );

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

      it('should check if workspaces contain a package.json file', async () => {
        await listWorkspacesWithChanges();
        const matchingWorkspaces = stdoutArray.filter(x =>
          x.startsWith('workspaces/'),
        );

        assert.equal(mockStat.mock.callCount(), matchingWorkspaces.length);
        matchingWorkspaces.forEach((workspace, i) => {
          assert.deepEqual(mockStat.mock.calls[i].arguments, [
            path.join(workspace, 'package.json'),
          ]);
        });
      });

      it('should read package.json from each workspace', async () => {
        await listWorkspacesWithChanges();

        assert.equal(mockReadFile.mock.callCount(), expectedWorkspaces.length);
        expectedWorkspaces.forEach((workspace, i) => {
          assert.deepEqual(mockReadFile.mock.calls[i].arguments, [
            path.join('workspaces', workspace, 'package.json'),
          ]);
        });
      });

      it('should append changed workspaces to GITHUB_OUTPUT', async () => {
        await listWorkspacesWithChanges();

        assert.equal(mockAppendFile.mock.callCount(), 2);
        assert.deepEqual(mockAppendFile.mock.calls[0].arguments, [
          GITHUB_OUTPUT,
          `workspaces=${JSON.stringify(expectedWorkspaces)}\n`,
        ]);
      });

      it('should append changed workspace node versions to GITHUB_OUTPUT', async () => {
        await listWorkspacesWithChanges();
        const expectedOutput = expectedWorkspaces.flatMap(workspace => [
          { workspace, nodeVersion: '20.x' },
          { workspace, nodeVersion: '22.x' },
        ]);

        assert.equal(mockAppendFile.mock.callCount(), 2);
        assert.deepEqual(mockAppendFile.mock.calls[1].arguments, [
          GITHUB_OUTPUT,
          `workspace_node_matrix=${JSON.stringify(expectedOutput)}\n`,
        ]);
      });

      it('should append changed workspace node versions that do not start with numbers', async () => {
        const nodeVersion = '>=24';
        mockReadFile.mock.mockImplementation(async () =>
          JSON.stringify({ engines: { node: nodeVersion } }),
        );

        await listWorkspacesWithChanges();
        const expectedOutput = expectedWorkspaces.map(workspace => ({
          workspace,
          nodeVersion,
        }));

        assert.equal(mockAppendFile.mock.callCount(), 2);
        assert.deepEqual(mockAppendFile.mock.calls[1].arguments, [
          GITHUB_OUTPUT,
          `workspace_node_matrix=${JSON.stringify(expectedOutput)}\n`,
        ]);
      });
    });
  });
});
