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
import {
  getDependencyBumps,
  getWorkspaceName,
  renderChangeset,
  resolveChangesetMode,
} from './generate-bump-changesets.js';

describe('resolveChangesetMode', () => {
  it('resolves configured, omitted and invalid values', () => {
    assert.equal(resolveChangesetMode(undefined), 'all');
    assert.equal(resolveChangesetMode({ knipReports: true }), 'all');
    assert.equal(resolveChangesetMode({ dependencyChangesets: 'all' }), 'all');
    assert.equal(
      resolveChangesetMode({ dependencyChangesets: 'production' }),
      'production',
    );
    assert.equal(resolveChangesetMode({ dependencyChangesets: false }), false);
    assert.equal(resolveChangesetMode({ dependencyChangesets: 'yes' }), 'all');
  });
});

describe('getDependencyBumps', () => {
  const before = {
    name: '@backstage-community/plugin-example',
    version: '1.0.0',
    dependencies: { 'dep-a': '^1.0.0', 'dep-b': '^2.0.0' },
    peerDependencies: { react: '^18.0.0' },
    devDependencies: { jest: '^29.0.0' },
  };
  const after = {
    ...before,
    version: '1.0.1',
    dependencies: { 'dep-a': '^1.1.0', 'dep-b': '^2.0.0', 'dep-c': '^3.0.0' },
    peerDependencies: { react: '^18.3.0' },
    devDependencies: { jest: '^30.0.0' },
  };

  it('includes every section in "all" mode and ignores non-dependency fields', () => {
    assert.deepEqual(
      [...getDependencyBumps(before, after, 'all')],
      [
        ['dep-a', '^1.1.0'],
        ['dep-c', '^3.0.0'],
        ['react', '^18.3.0'],
        ['jest', '^30.0.0'],
      ],
    );
  });

  it('skips devDependencies in "production" mode', () => {
    const bumps = getDependencyBumps(before, after, 'production');
    assert.equal(bumps.has('jest'), false);
    assert.equal(bumps.size, 3);

    const devOnly = { ...before, devDependencies: { jest: '^30.0.0' } };
    assert.equal(getDependencyBumps(before, devOnly, 'production').size, 0);
    assert.equal(getDependencyBumps(before, devOnly, 'all').size, 1);
  });

  it('treats a missing previous file as all dependencies added', () => {
    assert.deepEqual(
      [...getDependencyBumps(undefined, { dependencies: { x: '1' } }, 'all')],
      [['x', '1']],
    );
  });
});

describe('getWorkspaceName', () => {
  it('only matches workspace plugin package.json files', () => {
    assert.equal(
      getWorkspaceName('workspaces/linguist/plugins/linguist/package.json'),
      'linguist',
    );
    assert.equal(
      getWorkspaceName('workspaces/linguist/package.json'),
      undefined,
    );
    assert.equal(
      getWorkspaceName('workspaces/linguist/packages/app/package.json'),
      undefined,
    );
    assert.equal(getWorkspaceName('package.json'), undefined);
  });
});

describe('renderChangeset', () => {
  it('renders a patch changeset listing each bump', () => {
    assert.equal(
      renderChangeset(
        ['@backstage-community/plugin-a', '@backstage-community/plugin-b'],
        new Map([
          ['dep-a', '^1.1.0'],
          ['react', '^18.3.0'],
        ]),
      ),
      [
        '---',
        "'@backstage-community/plugin-a': patch",
        "'@backstage-community/plugin-b': patch",
        '---',
        '',
        'Updated dependency `dep-a` to `^1.1.0`.',
        'Updated dependency `react` to `^18.3.0`.',
        '',
      ].join('\n'),
    );
  });
});
