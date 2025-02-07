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

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const EXCLUDED_WORKSPACES = ['noop', 'repo-tools'];

/**
 * Retrieves a list of workspace directory names from the 'workspaces' folder.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of workspace directory names,
 *                             excluding directories listed in EXCLUDED_WORKSPACES.
 * @throws {Error} If there are filesystem errors reading the directory
 */
export async function listWorkspaces() {
  const rootPath = resolve(__dirname, '..');
  const workspacePath = resolve(rootPath, 'workspaces');

  return (await fs.readdir(workspacePath, { withFileTypes: true }))
    .filter(w => w.isDirectory() && !EXCLUDED_WORKSPACES.includes(w.name))
    .map(w => w.name);
}
