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
import { exec } from 'child_process';
import { promisify } from 'util';
import { listWorkspaces } from './list-workspaces.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const execAsync = promisify(exec);

// Workspaces excluded from the issue templates that should still get PR labels.
// These are owned by the maintainers team (see CODEOWNERS).
const PR_ONLY_WORKSPACES = ['repo-tools'];

// Root tooling files owned by the maintainers team (see CODEOWNERS)
const MAINTAINER_ROOT_GLOBS = [
  'yarn.lock',
  'package.json',
  '.yarnrc.yml',
  '.yarn/**',
];

async function getMaintainerWorkspaces() {
  try {
    const { stdout } = await execAsync(
      'node scripts/list-maintainer-workspaces.js --json',
    );
    return JSON.parse(stdout.trim());
  } catch (error) {
    console.error('Error running list-maintainer-workspaces.js:', error);
    return [];
  }
}

async function main() {
  const rootPath = resolve(__dirname, '..');
  const githubIssueLabelerConfigPath = resolve(rootPath, '.github/labeler.yml');
  const githubPrLabelerConfigPath = resolve(rootPath, '.github/pr-labeler.yml');
  const workspaces = await listWorkspaces();
  const maintainerWorkspaces = await getMaintainerWorkspaces();
  const prWorkspaces = [...workspaces, ...PR_ONLY_WORKSPACES].sort();

  // Generate issue labeler configuration (based on issue template selection).
  // The negative lookahead stops a workspace from also matching longer names
  // that start with it (e.g. `scaffolder` vs `scaffolder-relation-processor`).
  const issueLabelMappings = [
    ...workspaces.map(
      w => `workspace/${w}:\n  - "Workspace\\\\s*${w}(?![\\\\w-])"`,
    ),
    `needs-triaging:\n  - "Workspace\\\\s*Select a workspace..."`,
  ].join('\n\n');

  // Generate PR labeler configuration (based on file changes)
  const prLabelMappings = [
    // Workspace labels for all workspaces
    ...prWorkspaces.map(
      w =>
        `workspace/${w}:\n- changed-files:\n  - any-glob-to-any-file: ['workspaces/${w}/**']`,
    ),
    // Owner/area-maintainers label for root files and maintainer workspaces
    `owner/area-maintainers:\n- changed-files:\n  - any-glob-to-any-file: [${[
      ...MAINTAINER_ROOT_GLOBS,
      ...[...maintainerWorkspaces, ...PR_ONLY_WORKSPACES]
        .sort()
        .map(w => `workspaces/${w}/**`),
    ]
      .map(g => `'${g}'`)
      .join(', ')}]`,
  ].join('\n\n');

  await fs.writeFile(githubIssueLabelerConfigPath, `${issueLabelMappings}\n`);
  await fs.writeFile(githubPrLabelerConfigPath, `${prLabelMappings}\n`);

  console.log(
    `Generated issue labeler configuration for ${workspaces.length} workspaces`,
  );
  console.log(
    `Generated PR labeler configuration for ${workspaces.length} workspaces`,
  );
  console.log(
    `Added owner/area-maintainers label for ${maintainerWorkspaces.length} maintainer workspaces`,
  );
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
