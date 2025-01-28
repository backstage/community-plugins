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
import { listWorkspaces } from './list-workspaces.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function main(_args) {
  const rootPath = resolve(__dirname, '..');
  const githubIssueSnippetsPath = resolve(
    rootPath,
    '.github/ISSUE_TEMPLATE/snippets',
  );

  // Get workspaces
  const workspaces = await listWorkspaces();

  // Creates a dropdown issue template field for selecting a workspace
  const dropdown = `type: dropdown
id: workspace
attributes:
  label: Workspace
  options:
${workspaces.map(w => `    - ${w}`).join('\n')}
  default: 0
validations:
  required: true
`;

  // Save workspaces to a file
  await fs.writeFile(
    resolve(githubIssueSnippetsPath, 'workspaces-dropdown.yaml'),
    dropdown,
  );
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
