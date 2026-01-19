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
import { execFile as execFileCb } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { resolve as resolvePath } from 'path';
import { EOL } from 'os';

import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const commitShaBefore = process.env.COMMIT_SHA_BEFORE;
const baseRef = process.env.BASE_REF || 'origin/main';

const execFile = promisify(execFileCb);

async function runPlain(cmd, ...args) {
  try {
    const { stdout } = await execFile(cmd, args, { shell: true });
    return stdout.trim();
  } catch (error) {
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }
    if (!error.code) {
      throw error;
    }
    throw new Error(
      `Command '${[cmd, ...args].join(' ')}' failed with code ${error.code}`,
    );
  }
}

async function main() {
  if (!process.env.GITHUB_OUTPUT) {
    throw new Error('GITHUB_OUTPUT environment variable not set');
  }
  const repoRoot = resolvePath(__dirname, '..', '..');
  process.chdir(repoRoot);

  const diff = process.env.COMMIT_SHA_BEFORE
    ? await runPlain('git', 'diff', '--name-only', commitShaBefore)
    : await runPlain('git', 'diff', '--name-only', `${baseRef}...`);

  const packageList = diff.split('\n');

  const workspaces = new Set(['noop']);
  for (const path of packageList) {
    const match = path.match(/^workspaces\/([^/]+)\//);
    if (match) {
      workspaces.add(match[1]);
    }
  }

  console.log('workspaces found with changes:', Array.from(workspaces));

  for (const workspace of workspaces) {
    if (
      !(await fs
        .stat(`workspaces/${workspace}/package.json`)
        .catch(() => false))
    ) {
      workspaces.delete(workspace);
    }
  }

  console.log('workspaces that exist:', Array.from(workspaces));

  // Automatically detect the supported Node versions from package.json
  const workspaceNodeMatrix = [];
  for (const workspace of workspaces) {
    const packageJson = JSON.parse(
      await fs.readFile(`workspaces/${workspace}/package.json`),
    );
    const nodeString = packageJson.engines.node;
    if (!nodeString) {
      throw new Error(
        `No node engine specified in workspaces/${workspace}/package.json`,
      );
    }
    const nodeVersions = nodeString.split('||').map(v => v.trim());
    console.log(
      `Detected node versions for workspace ${workspace}:`,
      nodeVersions,
    );
    // Convert versions like "18" to "18.x" for GitHub matrix usage
    nodeVersions.forEach(nodeVersion => {
      if (nodeVersion.match(/^\d\d$/)) {
        workspaceNodeMatrix.push({
          workspace,
          nodeVersion: `${nodeVersion}.x`,
        });
      } else {
        workspaceNodeMatrix.push({ workspace, nodeVersion });
      }
    });
  }

  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `workspaces=${JSON.stringify(Array.from(workspaces))}${EOL}`,
  );
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `workspace_node_matrix=${JSON.stringify(
      Array.from(workspaceNodeMatrix),
    )}${EOL}`,
  );
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
