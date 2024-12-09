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
import arrayToTable from 'array-to-table';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const EXCLUDED_WORKSPACES = ['noop', 'repo-tools'];

async function main(args) {
  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  const workspaceReports = [];

  // Get workspaces
  const workspaces = (await fs.readdir(workspacePath, { withFileTypes: true }))
    .filter(w => w.isDirectory() && !EXCLUDED_WORKSPACES.includes(w.name))
    .map(w => w.name);

  // Loop through workspaces
  for (const workspace of workspaces) {
    const workspaceReport = {
      workspace: `[${workspace}](https://github.com/backstage/community-plugins/tree/main/workspaces/${workspace})`,
      'version-compatibility': `![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbackstage%2Fcommunity-plugins%2Fmain%2Fworkspaces%2F${workspace}%2Fbackstage.json&query=%24.version&label=Backstage%20Version)`,
    };
    workspaceReports.push(workspaceReport);
  }

  const table = args.includes('--table');

  if (table) {
    console.log(arrayToTable(workspaceReports));
  } else {
    console.log(workspaceReports);
  }
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
