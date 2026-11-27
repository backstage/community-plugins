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
import {
  BLOCKED_LABEL,
  bcpOptIn,
  blockedLabelAction,
  isScheduledCandidate,
  evaluate,
  evaluateEvent,
  findTooNew,
  newNpmPackages,
  parseDuration,
  readMinimumReleaseAge,
} from './automerge-dependency-pr.js';

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

describe('evaluateEvent', () => {
  it('only trusts pushes from the dependency bots and service account', async () => {
    const files = ['workspaces/linguist/yarn.lock'];
    for (const actor of [
      'backstage-goalie[bot]',
      'dependabot[bot]',
      'backstage-service',
    ]) {
      assert.equal(
        (await evaluateEvent(actor, files, isOptedIn)).eligible,
        true,
        actor,
      );
    }
    const result = await evaluateEvent('some-contributor', files, isOptedIn);
    assert.equal(result.eligible, false);
    assert.match(result.reason, /some-contributor/);
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

const lock = entries =>
  entries
    .map(
      ([key, resolution]) =>
        `"${key}":\n  version: 0.0.0\n  resolution: "${resolution}"\n`,
    )
    .join('\n');

describe('parseDuration', () => {
  it('parses Renovate durations', () => {
    assert.equal(parseDuration(undefined), 0);
    assert.equal(parseDuration('3 days'), 3 * 86400e3);
    assert.equal(parseDuration('1 day'), 86400e3);
    assert.equal(parseDuration('72 hours'), 72 * 3600e3);
    assert.equal(parseDuration('2 weeks'), 14 * 86400e3);
    assert.throws(() => parseDuration('soon'), /Unsupported/);
  });

  it('reads the npm minimumReleaseAge from renovate.json', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'automerge-'));
    await fs.mkdir(path.join(root, '.github'));
    const write = config =>
      fs.writeFile(
        path.join(root, '.github', 'renovate.json'),
        JSON.stringify(config),
      );
    await write({ npm: { minimumReleaseAge: '3 days' } });
    assert.equal(await readMinimumReleaseAge(root), 3 * 86400e3);
    await write({ minimumReleaseAge: '1 day' });
    assert.equal(await readMinimumReleaseAge(root), 86400e3);
    await write({});
    assert.equal(await readMinimumReleaseAge(root), 0);
    await fs.rm(root, { recursive: true });
  });
});

describe('newNpmPackages', () => {
  it('returns only npm resolutions added in head', () => {
    const base = lock([
      ['lodash@npm:^4.17.0', 'lodash@npm:4.17.20'],
      ['@backstage/core@npm:^1.0.0', '@backstage/core@npm:1.0.0'],
    ]);
    const head = lock([
      ['lodash@npm:^4.17.0', 'lodash@npm:4.17.21'],
      ['@backstage/core@npm:^1.0.0', '@backstage/core@npm:1.0.0'],
      ['@scope/pkg@npm:^2.0.0', '@scope/pkg@npm:2.1.0'],
      ['app@workspace:packages/app', 'app@workspace:packages/app'],
      [
        'app@link:../app::locator=backend%40workspace%3Apackages%2Fbackend',
        'app@link:../app::locator=backend%40workspace%3Apackages%2Fbackend',
      ],
      [
        'resolve@patch:resolve@npm%3A^1.22.0#optional!builtin<compat/resolve>',
        'resolve@patch:resolve@npm%3A1.22.8#optional!builtin<compat/resolve>::version=1.22.8&hash=c3c19d',
      ],
    ]);
    assert.deepEqual(newNpmPackages(base, head), [
      { name: 'lodash', version: '4.17.21' },
      { name: '@scope/pkg', version: '2.1.0' },
      { name: 'resolve', version: '1.22.8' },
    ]);
    assert.deepEqual(newNpmPackages('', ''), []);
  });

  it('rejects resolutions whose age cannot be checked', () => {
    const head = lock([
      ['pkg@https://example.com/pkg.tgz', 'pkg@https://example.com/pkg.tgz'],
    ]);
    assert.throws(() => newNpmPackages('', head), /release age/);
  });
});

describe('findTooNew', () => {
  const now = Date.parse('2026-11-27T12:00:00Z');
  const day = 86400e3;
  const published = {
    old: new Date(now - 5 * day),
    fresh: new Date(now - 1 * day),
  };
  const getTime = async name => published[name];

  it('finds packages newer than the minimum age', async () => {
    assert.equal(
      await findTooNew([{ name: 'old', version: '1' }], 3 * day, now, getTime),
      undefined,
    );
    const tooNew = await findTooNew(
      [
        { name: 'old', version: '1' },
        { name: 'fresh', version: '2' },
      ],
      3 * day,
      now,
      getTime,
    );
    assert.equal(tooNew.name, 'fresh');
  });

  it('skips the check without a minimum and fails on unknown times', async () => {
    assert.equal(
      await findTooNew([{ name: 'fresh', version: '2' }], 0, now, getTime),
      undefined,
    );
    await assert.rejects(
      findTooNew([{ name: 'missing', version: '1' }], day, now, getTime),
      /No publish time/,
    );
  });
});

describe('blockedLabelAction', () => {
  it('blocks on pushes by others and unblocks when a bot rewrites the branch', () => {
    assert.equal(blockedLabelAction('some-contributor', false), 'add');
    assert.equal(blockedLabelAction('some-contributor', true), undefined);
    assert.equal(blockedLabelAction('dependabot[bot]', true), 'remove');
    assert.equal(blockedLabelAction('backstage-goalie[bot]', false), undefined);
  });
});

describe('isScheduledCandidate', () => {
  const repository = 'backstage/community-plugins';
  const pr = (login, ref, labels, full_name = repository) => ({
    user: { login },
    head: { ref, repo: { full_name } },
    labels: labels.map(name => ({ name })),
  });

  it('picks open dependency PRs from the bots on their own branches', () => {
    assert.equal(
      isScheduledCandidate(
        pr('backstage-goalie[bot]', 'renovate/x', ['dependencies']),
        repository,
      ),
      true,
    );
    assert.equal(
      isScheduledCandidate(
        pr('dependabot[bot]', 'dependabot/npm/x', ['dependencies']),
        repository,
      ),
      true,
    );
  });

  it('skips blocked, unlabelled, forked or mismatched PRs', () => {
    for (const candidate of [
      pr('dependabot[bot]', 'dependabot/x', ['dependencies', BLOCKED_LABEL]),
      pr('dependabot[bot]', 'dependabot/x', []),
      pr('dependabot[bot]', 'dependabot/x', ['dependencies'], 'fork/repo'),
      pr('dependabot[bot]', 'renovate/x', ['dependencies']),
      pr('some-contributor', 'renovate/x', ['dependencies']),
    ]) {
      assert.equal(isScheduledCandidate(candidate, repository), false);
    }
  });
});
