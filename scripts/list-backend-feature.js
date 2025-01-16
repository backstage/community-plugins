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
import { listWorkspaces } from './list-workspaces.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const BACKEND_FEATURE =
  "import { BackendFeature } from '@backstage/backend-plugin-api';";
const BACKEND_FEATURE_COMPAT =
  "import { BackendFeatureCompat } from '@backstage/backend-plugin-api';";

async function main(args) {
  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  const backendFeatureReports = [];

  // Get workspaces
  const workspaces = await listWorkspaces();

  // Loop through workspaces
  for (const workspace of workspaces) {
    const currentWorkspacePath = resolve(workspacePath, workspace);
    const { packages } = await getPackages(currentWorkspacePath);

    // Loop through packages in each workspace
    for (const pkg of packages) {
      const pkgRole = pkg.packageJson.backstage?.role;

      if (pkgRole === 'backend-plugin' || pkgRole === 'backend-plugin-module') {
        const backendFeatureReport = {
          package: undefined,
          role: undefined,
          supported: undefined,
          alpha: undefined,
          readme: undefined,
        };
        backendFeatureReport.package = pkg.packageJson.name;
        backendFeatureReport.role = pkgRole;
        backendFeatureReport.readme = `[README](${pkg.packageJson.repository.url}/blob/master/${pkg.packageJson.repository.directory}/README.md)`;
        const apiReportPath = join(pkg.dir, 'report.api.md');
        const apiReport = (await fs.readFile(apiReportPath)).toString();
        if (
          apiReport.includes(BACKEND_FEATURE) ||
          apiReport.includes(BACKEND_FEATURE_COMPAT)
        ) {
          backendFeatureReport.supported = true;
          backendFeatureReport.alpha = false;
        }

        const apiReportAlphaPath = join(pkg.dir, 'report-alpha.api.md');
        if (fs.existsSync(apiReportAlphaPath)) {
          const apiReportAlpha = (
            await fs.readFile(apiReportAlphaPath)
          ).toString();
          if (
            apiReportAlpha.includes(BACKEND_FEATURE) ||
            apiReportAlpha.includes(BACKEND_FEATURE_COMPAT)
          ) {
            backendFeatureReport.supported = true;
            backendFeatureReport.alpha = true;
          }
        }

        backendFeatureReports.push(backendFeatureReport);
      }
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
