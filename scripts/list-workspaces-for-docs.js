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
import { resolve, join } from 'path';
import arrayToTable from 'array-to-table';

import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const EXCLUDED_WORKSPACES = ['noop', 'repo-tools'];
const BACKEND_FEATURE =
  "import { BackendFeatureCompat } from '@backstage/backend-plugin-api';";

async function main(args) {
  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  const backendFeatureReports = [];

  // Get workspaces
  const workspaces = (await fs.readdir(workspacePath, { withFileTypes: true }))
    .filter((w) => w.isDirectory() && !EXCLUDED_WORKSPACES.includes(w.name))
    .map((w) => w.name);

  // Loop through workspaces
  for (const workspace of workspaces) {
    const currentWorkspacePath = resolve(workspacePath, workspace);
    const { packages } = await getPackages(currentWorkspacePath);

    // Loop through packages in each workspace
    for (const pkg of packages) {
      const pkgRole = pkg.packageJson.backstage?.role;

      const workspaceReport = {
        workspace: workspace,
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

main(process.argv.slice(2)).catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
