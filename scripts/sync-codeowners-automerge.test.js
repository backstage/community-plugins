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
  BLOCK_END,
  BLOCK_START,
  getWorkspaceOwners,
  renderCodeowners,
} from './sync-codeowners-automerge.js';

const base = [
  '*                    @backstage/community-plugins-maintainers',
  '/workspaces/catalog  @backstage/community-plugins-maintainers  @awanlin @freben',
  '/workspaces/catalog/plugins/x  @someone',
  '/workspaces/jenkins  @backstage/community-plugins-maintainers',
  '',
].join('\n');

describe('getWorkspaceOwners', () => {
  it('returns owners from the exact workspace line', () => {
    assert.deepEqual(getWorkspaceOwners(base, 'catalog'), [
      '@backstage/community-plugins-maintainers',
      '@awanlin',
      '@freben',
    ]);
    assert.equal(getWorkspaceOwners(base, 'missing'), undefined);
  });
});

describe('renderCodeowners', () => {
  it('appends a block with each workspace owners plus the service account', () => {
    const result = renderCodeowners(base, ['catalog', 'jenkins']);
    const block = result.slice(result.indexOf(BLOCK_START));
    const lines = block.split('\n');
    assert.equal(lines[0], BLOCK_START);
    assert.match(block, /must stay at the end of this file/);
    const entries = lines.filter(l => !l.startsWith('#') && l.trim());
    assert.equal(entries.length, 2);
    assert.match(
      entries[0],
      /^\/workspaces\/catalog\/yarn\.lock\s+@backstage\/community-plugins-maintainers @awanlin @freben @backstage-service$/,
    );
    assert.match(
      entries[1],
      /^\/workspaces\/jenkins\/yarn\.lock\s+@backstage\/community-plugins-maintainers @backstage-service$/,
    );
    assert.equal(lines.filter(Boolean).pop(), BLOCK_END);
    // Block must be last so it takes precedence
    assert.ok(result.trimEnd().endsWith(BLOCK_END));
  });

  it('is idempotent and replaces an existing block', () => {
    const once = renderCodeowners(base, ['catalog', 'jenkins']);
    assert.equal(renderCodeowners(once, ['catalog', 'jenkins']), once);

    const fewer = renderCodeowners(once, ['jenkins']);
    assert.equal(fewer.includes('/workspaces/catalog/yarn.lock'), false);
    assert.equal(fewer.split(BLOCK_START).length, 2);

    assert.equal(renderCodeowners(once, []), base);
  });

  it('fails when an opted-in workspace has no CODEOWNERS entry', () => {
    assert.throws(() => renderCodeowners(base, ['missing']), /missing/);
  });
});
