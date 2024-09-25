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
const BACKSTAGE_PLUGIN =
  "import { BackstagePlugin } from '@backstage/frontend-plugin-api';";

async function main(args) {
  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  const frontendFeatureReports = [];

  // Get workspaces
  const workspaces = (await fs.readdir(workspacePath, { withFileTypes: true }))
    .filter(w => w.isDirectory() && !EXCLUDED_WORKSPACES.includes(w.name))
    .map(w => w.name);

  // Loop through workspaces
  for (const workspace of workspaces) {
    const currentWorkspacePath = resolve(workspacePath, workspace);
    const { packages } = await getPackages(currentWorkspacePath);

    // Loop through packages in each workspace
    for (const pkg of packages) {
      const pkgRole = pkg.packageJson.backstage?.role;

      if (pkgRole === 'frontend-plugin') {
        const frontendFeatureReport = {
          package: undefined,
          role: undefined,
          supported: undefined,
          alpha: undefined,
          readme: undefined,
        };
        frontendFeatureReport.package = pkg.packageJson.name;
        frontendFeatureReport.role = pkgRole;
        frontendFeatureReport.readme = `[README](${pkg.packageJson.repository.url}/blob/master/${pkg.packageJson.repository.directory}/README.md)`;
        const apiReportPath = join(pkg.dir, 'api-report.md');
        const apiReport = (await fs.readFile(apiReportPath)).toString();
        if (apiReport.includes(BACKSTAGE_PLUGIN)) {
          frontendFeatureReport.supported = true;
          frontendFeatureReport.alpha = false;
        }

        const apiReportAlphaPath = join(pkg.dir, 'api-report-alpha.md');
        if (fs.existsSync(apiReportAlphaPath)) {
          const apiReportAlpha = (
            await fs.readFile(apiReportAlphaPath)
          ).toString();
          if (apiReportAlpha.includes(BACKSTAGE_PLUGIN)) {
            frontendFeatureReport.supported = true;
            frontendFeatureReport.alpha = true;
          }
        }

        frontendFeatureReports.push(frontendFeatureReport);
      }
    }
  }

  const table = args.includes('--table');

  if (table) {
    console.log(arrayToTable(frontendFeatureReports));
  } else {
    console.log(frontendFeatureReports);
  }
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
