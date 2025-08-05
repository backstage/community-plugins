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
import { getPackages } from '@manypkg/get-packages';
import { resolve } from 'path';
import arrayToTable from 'array-to-table';
import * as url from 'url';
import * as codeowners from 'codeowners-utils';
import { listWorkspaces } from './list-workspaces.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function main(args) {
  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  const backendFeatureReports = [];

  // Get `CODEOWNERS` entries
  const codeownersPath = resolve(rootPath, '.github', 'CODEOWNERS');
  const codeOwnerEntries = await codeowners.loadOwners(codeownersPath);

  // Get workspaces
  const workspaces = await listWorkspaces();

  // Loop through workspaces
  for (const workspace of workspaces) {
    // Find the owner by looking up the workspace in the `CODEOWNERS` file
    const owners = codeOwnerEntries
      .filter(c => c.pattern === `/workspaces/${workspace}`)
      .map(o => o.owners)
      .flat();
    const filteredOwners = owners.filter(
      o => o !== '@backstage/community-plugins-maintainers',
    );
    filteredOwners.forEach((owner, index) => {
      if (owner.includes('/')) {
        const org = owner.substring(1, owner.indexOf('/'));
        const team = owner.substring(owner.indexOf('/') + 1);
        filteredOwners[
          index
        ] = `[${owner}](https://github.com/orgs/${org}/teams/${team})`;
      } else {
        filteredOwners[
          index
        ] = `[${owner}](https://github.com/${owner.substring(1)})`;
      }
    });
    const workspaceOwners =
      filteredOwners.length === 0
        ? '[@backstage/community-plugins-maintainers](https://github.com/orgs/backstage/teams/community-plugins-maintainers)'
        : filteredOwners.join(', ');

    const currentWorkspacePath = resolve(workspacePath, workspace);
    const { packages } = await getPackages(currentWorkspacePath);

    // Loop through packages in each workspace
    for (const pkg of packages) {
      if (pkg.packageJson.private) {
        continue;
      }
      const pkgRole = pkg.packageJson.backstage?.role;

      const workspaceReport = {
        workspace: workspace,
        owner: workspaceOwners,
        package: undefined,
        role: undefined,
        readme: undefined,
      };
      workspaceReport.package = pkg.packageJson.name;
      workspaceReport.role = pkgRole;
      workspaceReport.readme = `[README](${pkg.packageJson.repository.url}/blob/master/${pkg.packageJson.repository.directory}/README.md)`;
      backendFeatureReports.push(workspaceReport);
    }
  }

  const table = args.includes('--table');

  if (table) {
    console.log(arrayToTable(backendFeatureReports));
  } else {
    console.log(backendFeatureReports);
  }
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
