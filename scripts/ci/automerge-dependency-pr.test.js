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

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { bcpOptIn, evaluate } from './automerge-dependency-pr.js';

const optedIn = new Set(['linguist', 'catalog']);
const isOptedIn = async workspace => optedIn.has(workspace);

describe('evaluate', () => {
  it('accepts lockfile-only changes in opted-in workspaces', async () => {
    assert.deepEqual(
      await evaluate(['workspaces/linguist/yarn.lock'], isOptedIn),
      { eligible: true, workspaces: ['linguist'] },
    );
    assert.deepEqual(
      await evaluate(
        ['workspaces/linguist/yarn.lock', 'workspaces/catalog/yarn.lock'],
        isOptedIn,
      ),
      { eligible: true, workspaces: ['linguist', 'catalog'] },
    );
  });

  it('rejects anything other than workspace lockfiles', async () => {
    for (const files of [
      [],
      ['workspaces/linguist/yarn.lock', 'workspaces/linguist/package.json'],
      ['workspaces/linguist/plugins/linguist/package.json'],
      ['workspaces/linguist/.changeset/renovate-abc.md'],
      ['yarn.lock'],
      ['workspaces/linguist/packages/app/yarn.lock'],
    ]) {
      const result = await evaluate(files, isOptedIn);
      assert.equal(result.eligible, false, JSON.stringify(files));
    }
  });

  it('requires every touched workspace to have opted in', async () => {
    const result = await evaluate(
      ['workspaces/linguist/yarn.lock', 'workspaces/jenkins/yarn.lock'],
      isOptedIn,
    );
    assert.equal(result.eligible, false);
    assert.match(result.reason, /jenkins/);
  });
});

describe('bcpOptIn', () => {
  it('only opts in when autoMergeDependencies is exactly true', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'automerge-'));
    const write = async (workspace, bcp) => {
      await fs.mkdir(path.join(root, 'workspaces', workspace), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(root, 'workspaces', workspace, 'bcp.json'),
        JSON.stringify(bcp),
      );
    };
    await write('on', { autoMergeDependencies: true });
    await write('string', { autoMergeDependencies: 'true' });
    await write('off', { knipReports: true });

    const check = bcpOptIn(root);
    assert.equal(await check('on'), true);
    assert.equal(await check('string'), false);
    assert.equal(await check('off'), false);
    assert.equal(await check('missing'), false);

    await fs.rm(root, { recursive: true });
  });
});
