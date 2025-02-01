#!/usr/bin/env node
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

import fs from 'fs-extra';
import { resolve } from 'path';
import * as url from 'url';
import * as codeowners from 'codeowners-utils';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const EXCLUDED_WORKSPACES = ['noop', 'repo-tools'];

async function main() {
  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  // Get `CODEOWNERS` entries
  const codeownersPath = resolve(rootPath, '.github', 'CODEOWNERS');
  const codeOwnerEntries = await codeowners.loadOwners(codeownersPath);

  // Get workspaces
  const workspaces = (await fs.readdir(workspacePath, { withFileTypes: true }))
    .filter(w => w.isDirectory() && !EXCLUDED_WORKSPACES.includes(w.name))
    .map(w => w.name);

  const maintainerWorkspaces = [];

  // Loop through workspaces
  for (const workspace of workspaces) {
    // Find the owner by looking up the workspace in the `CODEOWNERS` file
    const owners = codeOwnerEntries
      .filter(c => c.pattern === `/workspaces/${workspace}`)
      .map(o => o.owners)
      .flat();

    if (owners.length === 0) {
      maintainerWorkspaces.push(workspace);
    }
  }

  // How many workspaces do we own?
  console.log(`Workspace count: ${maintainerWorkspaces.length} \n`);

  // Output in chunks of 10
  const chunkSize = 10;
  for (let i = 0; i < maintainerWorkspaces.length; i += chunkSize) {
    const chunk = maintainerWorkspaces.slice(i, i + chunkSize);
    console.log(`${JSON.stringify(chunk)}\n`);
  }
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
