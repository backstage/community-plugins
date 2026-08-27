#!/usr/bin/env node
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

/**
 * Keeps the `matchFileNames` list in the "maintainer-owned workspace
 * dependencies" Renovate rule in sync with CODEOWNERS.
 *
 * Usage:
 *   node scripts/sync-renovate-maintainer-workspaces.js         # update
 *   node scripts/sync-renovate-maintainer-workspaces.js --check # verify (exit 1 if out of sync)
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import * as url from 'node:url';
import * as codeowners from 'codeowners-utils';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const RENOVATE_RULE_NAME = 'maintainer-owned workspace dependencies';

async function main(args) {
  const checkOnly = args.includes('--check');
  const rootPath = resolve(__dirname, '..');

  const codeownersPath = resolve(rootPath, '.github', 'CODEOWNERS');
  const codeOwnerEntries = await codeowners.loadOwners(codeownersPath);

  const allWorkspaces = fs
    .readdirSync(resolve(rootPath, 'workspaces'), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const maintainerWorkspaces = allWorkspaces.filter(workspace => {
    const owners = codeOwnerEntries
      .filter(c => c.pattern === `/workspaces/${workspace}`)
      .flatMap(c => c.owners);

    return (
      owners.length === 0 ||
      (owners.length === 1 &&
        owners[0] === '@backstage/community-plugins-maintainers')
    );
  });

  const renovatePath = resolve(rootPath, '.github', 'renovate.json');
  const renovate = JSON.parse(fs.readFileSync(renovatePath, 'utf8'));

  const rule = renovate.packageRules.find(
    r => r.groupName === RENOVATE_RULE_NAME,
  );
  if (!rule) {
    process.stderr.write(
      `Error: could not find "${RENOVATE_RULE_NAME}" rule in .github/renovate.json\n`,
    );
    process.exit(1);
  }

  const expected = maintainerWorkspaces.map(w => `workspaces/${w}/**`);

  if (checkOnly) {
    const current = [...(rule.matchFileNames ?? [])].sort().join('\n');
    const want = [...expected].sort().join('\n');
    if (current !== want) {
      process.stderr.write(
        `Out of sync. Run: node scripts/sync-renovate-maintainer-workspaces.js\n`,
      );
      process.exit(1);
    }
    console.log(
      `renovate.json is in sync (${maintainerWorkspaces.length} maintainer-owned workspaces).`,
    );
    return;
  }

  rule.matchFileNames = expected;
  fs.writeFileSync(renovatePath, `${JSON.stringify(renovate, null, 2)}\n`);
  execSync('yarn prettier --write .github/renovate.json', {
    cwd: rootPath,
    stdio: 'inherit',
  });

  console.log(
    `Synced ${maintainerWorkspaces.length} maintainer-owned workspaces to .github/renovate.json`,
  );
}

main(process.argv.slice(2)).catch(err => {
  console.error(err.stack ?? err);
  process.exit(1);
});
