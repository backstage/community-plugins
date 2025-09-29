/*
 * Copyright 2025 The Backstage Authors
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

async function main() {
  const rootPath = resolve(__dirname, '..');
  const githubIssueLabelerConfigPath = resolve(rootPath, '.github/labeler.yml');
  const githubPrLabelerConfigPath = resolve(rootPath, '.github/pr-labeler.yml');
  const workspaces = await listWorkspaces();

  // Generate issue labeler configuration (based on issue template selection)
  const issueLabelMappings = [
    ...workspaces.map(w => `workspace/${w}:\n  - "Workspace\\\\s*${w}"`),
    `needs-triaging:\n  - "Workspace\\\\s*Select a workspace..."`,
  ].join('\n\n');

  // Generate PR labeler configuration (based on file changes)
  const prLabelMappings = workspaces
    .map(w => `workspace/${w}:\n  - "workspaces/${w}/**"`)
    .join('\n\n');

  await fs.writeFile(githubIssueLabelerConfigPath, issueLabelMappings);
  await fs.writeFile(githubPrLabelerConfigPath, prLabelMappings);

  console.log(
    `Generated issue labeler configuration for ${workspaces.length} workspaces`,
  );
  console.log(
    `Generated PR labeler configuration for ${workspaces.length} workspaces`,
  );
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
