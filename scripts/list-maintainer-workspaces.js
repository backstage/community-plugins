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

import fs from 'fs';
import { resolve, join } from 'path';
import * as url from 'url';
import * as codeowners from 'codeowners-utils';
import { listWorkspaces } from './list-workspaces.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function main(args) {
  const rootPath = resolve(__dirname, '..');

  // Get `CODEOWNERS` entries
  const codeownersPath = resolve(rootPath, '.github', 'CODEOWNERS');
  const codeOwnerEntries = await codeowners.loadOwners(codeownersPath);

  // Get workspaces
  const workspaces = await listWorkspaces();

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
    } else if (
      owners.length === 1 &&
      owners[0] === '@backstage/community-plugins-maintainers'
    ) {
      maintainerWorkspaces.push(workspace);
    }
  }

  // Check if --json flag is provided
  if (args.includes('--json')) {
    console.log(JSON.stringify(maintainerWorkspaces));
    return;
  }

  // Default behavior - detailed output
  // How many workspaces do we own?
  console.log(`Workspace count: ${maintainerWorkspaces.length} \n`);

  // Output in chunks of 10
  const chunkSize = 10;
  for (let i = 0; i < maintainerWorkspaces.length; i += chunkSize) {
    const chunk = maintainerWorkspaces.slice(i, i + chunkSize);
    console.log(`${JSON.stringify(chunk)}\n`);
  }

  const maintainerWorkspacesReport = [];
  for (const workspace of maintainerWorkspaces) {
    const workspacePath = resolve(rootPath, 'workspaces');
    const currentWorkspacePath = resolve(workspacePath, workspace);

    // version
    const backstageFile = join(currentWorkspacePath, 'backstage.json');
    let version = '';
    if (fs.existsSync(backstageFile)) {
      const file = fs.readFileSync(backstageFile);
      const json = JSON.parse(file);
      version = json.version;
    }

    // yarn plugin
    const yarnPluginFile = join(
      currentWorkspacePath,
      '.yarn/plugins/@yarnpkg/plugin-backstage.cjs',
    );
    const usesYarnPlugin = fs.existsSync(yarnPluginFile);

    // bcp.json
    const bcpFile = join(currentWorkspacePath, 'bcp.json');
    const usesBcp = fs.existsSync(bcpFile);
    let usesBcpKnipReports = false;
    let usesBcpAutoVersionBump = false;
    let usedBcpListDeprecations = false;
    if (usesBcp) {
      const file = fs.readFileSync(bcpFile);
      const json = JSON.parse(file);
      usesBcpKnipReports = json.knipReports;
      usesBcpAutoVersionBump = json.autoVersionBump;
      usedBcpListDeprecations = json.listDeprecations;
    }

    const report = {
      workspace,
      version,
      usesYarnPlugin,
      usesBcp,
      usesBcpKnipReports,
      usesBcpAutoVersionBump,
      usedBcpListDeprecations,
    };
    maintainerWorkspacesReport.push(report);
  }

  console.table(maintainerWorkspacesReport);
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
