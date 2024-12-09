/*
 * Copyright 2024 The Backstage Authors
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

import { promisify } from 'util';
import { exec as execOriginal } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const exec = promisify(execOriginal);

async function main() {
  console.log('Generating changesets for package.json dependency bumps...');
  const { stdout: diffOutput } = await exec('git diff --name-only HEAD~1');

  const diffFiles = diffOutput.split('\n');
  if (diffFiles.find(f => path.matchesGlob(f, 'workspaces/*/.changeset/*'))) {
    console.log('Changeset already exists, skipping');
    return;
  }
  const files = diffFiles
    .filter(file => file !== 'package.json') // skip root package.json
    .filter(file =>
      path.matchesGlob(file, 'workspaces/*/plugins/*/package.json'),
    );

  const workspaces = await getPackagesNamesByWorkspace(files);
  if (!Object.keys(workspaces).length) {
    console.log('No package.json changes found, skipping');
    return;
  }

  const packageBumps = await getBumps(files);
  if (packageBumps.size === 0) {
    console.log('No bumps in published packages, skipping');
    return;
  }

  const { stdout: shortHash } = await exec('git rev-parse --short HEAD');

  for (const workspace of Object.keys(workspaces)) {
    const fileName = `workspaces/${workspace}/.changeset/renovate-${shortHash.trim()}.md`;
    console.log(`Creating changeset ${fileName}`);
    await createChangeset(fileName, packageBumps, workspaces[workspace]);
    await exec(`git add ${fileName}`);
  }
  await exec('git commit --amend --no-edit');
  await exec('git push -f');
  console.log(`Added changeset for commit ${shortHash.trim()}`);
}

// Parses package.json files and returns the package names
async function getPackagesNamesByWorkspace(files) {
  const workspaces = {};
  for (const file of files) {
    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    const workspace = path
      .dirname(path.resolve(file, '../..'))
      .split(path.sep)
      .pop();

    if (!data.private) {
      const names = workspaces[workspace] || [];
      if (!workspaces[workspace]) {
        workspaces[workspace] = names;
      }
      names.push(data.name);
    }
  }
  return workspaces;
}

async function getBumps(files) {
  const bumps = new Map();
  for (const file of files) {
    const { stdout: changes } = await exec(`git show ${file}`);
    const packageDef = JSON.parse(
      await fs.readFile(path.join(process.cwd(), file), 'utf8'),
    );
    for (const change of changes.split('\n')) {
      if (!change.startsWith('+ ')) {
        continue;
      }

      const match = change.match(/"(.*?)"/g);
      const pkg = match[0].replace(/"/g, '');
      const version = match[1].replace(/"/g, '');

      // Only generate changesets for published packages
      if (packageDef.private) {
        console.log(`Ignoring bump in private package ${packageDef.name}`);
        continue;
      }

      bumps.set(pkg, version);
    }
  }

  return bumps;
}

async function createChangeset(fileName, packageBumps, packages) {
  let message = '';
  for (const [pkg, bump] of packageBumps) {
    message = `${message}Updated dependency \`${pkg}\` to \`${bump}\`.\n`;
  }

  const pkgs = packages.map(pkg => `'${pkg}': patch`).join('\n');
  const body = `---\n${pkgs}\n---\n\n${message.trim()}\n`;
  await fs.writeFile(fileName, body);
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
