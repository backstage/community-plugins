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

import { readdir } from 'fs/promises';
import { resolve } from 'path';

const EXCLUDED_WORKSPACES = ['noop', 'repo-tools'];

export default async function listWorkspacesCommand(options: {
  json?: boolean;
}) {
  // Find workspaces directory from current working directory
  const workspacesPath = resolve(process.cwd(), 'workspaces');

  // Get all workspace directories
  const workspaces = (await readdir(workspacesPath, { withFileTypes: true }))
    .filter(w => w.isDirectory() && !EXCLUDED_WORKSPACES.includes(w.name))
    .map(w => w.name);

  // Output results
  if (options.json) {
    console.log(JSON.stringify(workspaces, null, 2));
  } else {
    console.log(`Found ${workspaces.length} workspaces:\n`);
    workspaces.forEach(workspace => console.log(`  ${workspace}`));
  }
}
