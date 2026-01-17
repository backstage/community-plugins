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

import fs from 'node:fs/promises';
import { basename, join, resolve, sep } from 'path';
import * as url from 'url';

const EXCLUDED_WORKSPACES = ['noop', 'repo-tools'];

/**
 * Retrieves a list of workspace names from the 'workspaces' folder.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of workspace names,
 *                             excluding workspaces listed in EXCLUDED_WORKSPACES.
 * @throws {Error} If there are filesystem errors reading the directory
 */
export async function listWorkspaces(settings = { fullPath: false }) {
  const workspacePath = resolve(
    url.fileURLToPath(import.meta.url),
    '..',
    'workspaces',
  );

  return (
    Array.fromAsync(
      fs.glob(join(workspacePath, '*', sep), {
        exclude: EXCLUDED_WORKSPACES.map(name => join(workspacePath, name)),
      }),
      settings?.fullPath === false
        ? workspace => basename(workspace)
        : // no work to do here
          undefined,
    )
      // glob returns an unordered list of results (for perf reasons)
      .then(workspaces => workspaces.sort())
  );
}
