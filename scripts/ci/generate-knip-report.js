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

import { resolve as resolvePath } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import url from 'url';
import { promisify } from 'util';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolvePath(__dirname, '..', '..');

const execAsync = promisify(exec);

async function handlePackage() {
  const rootDirPath = resolvePath(repoRoot, 'workspaces');

  const dirContents = await fs.readdir(rootDirPath, {
    withFileTypes: true,
  });

  for (const item of dirContents) {
    if (item.isDirectory()) {
      const packageDir = item.name;
      const fullDir = resolvePath(repoRoot, 'workspaces', packageDir);

      try {
        console.log(`Processing directory: ${fullDir}`);

        // Run `yarn backstage-repo-tools knip-reports`
        await execAsync('yarn backstage-repo-tools knip-reports', {
          cwd: fullDir,
        });
        console.log(`Ran knip-reports in ${fullDir}`);
      } catch (error) {
        console.error(`Error processing ${fullDir}:`, error.message);
      }
    }
  }
}

handlePackage().catch(error => {
  console.error('Error in handlePackage:', error.message);
});
