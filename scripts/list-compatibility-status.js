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
import arrayToTable from 'array-to-table';
import { listWorkspaces } from './list-workspaces.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function main(args) {
  const workspaceReports = [];

  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  // Get workspaces
  const workspaces = await listWorkspaces();

  // Loop through workspaces
  for (const workspace of workspaces) {
    const currentWorkspacePath = resolve(workspacePath, workspace);
    if (fs.existsSync(`${currentWorkspacePath}/backstage.json`)) {
      const backstageJson = JSON.parse(
        await fs.readFile(`${currentWorkspacePath}/backstage.json`),
      );
      const workspaceReport = {
        workspace: workspace,
        version: backstageJson.version,
      };
      workspaceReports.push(workspaceReport);
    }
  }

  const sortedWorkspaceReport = workspaceReports.sort((a, b) => {
    if (a.version !== b.version) return a.version.localeCompare(b.version);
    return a.workspace.localeCompare(b.workspace);
  });

  const table = args.includes('--table');

  if (table) {
    console.log(arrayToTable(sortedWorkspaceReport));
  } else {
    console.log(sortedWorkspaceReport);
  }
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
