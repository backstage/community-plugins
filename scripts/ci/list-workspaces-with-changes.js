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
import fs from 'fs/promises';
import { promisify } from 'util';
import { join, resolve as resolvePath } from 'path';
import { EOL } from 'os';

import * as url from 'url';

import { asyncFilter } from '../utils.js';

const baseRef = process.env.BASE_REF || 'origin/main';

const execFile = promisify(execFileCb);
const reWorkspaces = /^workspaces\/(?<workspace>[^/]+)\//;

const nameOnly = fullPath => fullPath.split('/').at(1);
const expand = workspace => join('workspaces', workspace, 'package.json');

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

export async function main() {
  if (!process.env.GITHUB_OUTPUT) {
    throw new Error('GITHUB_OUTPUT environment variable not set');
  }
  const repoRoot = resolvePath(
    url.fileURLToPath(import.meta.url),
    '..',
    '..',
    '..',
  );
  process.chdir(repoRoot);

  const diff = await runPlain(
    'git',
    'diff',
    '--name-only',
    process.env.COMMIT_SHA_BEFORE || `${baseRef}...`,
  );

  const workspaces = Array.from(
    diff.split('\n').reduce((result, path) => {
      const { workspace } = path.match(reWorkspaces)?.groups || {};

      if (workspace) {
        result.add(workspace);
      }

      return result;
    }, new Set(['noop'])),
    expand,
  );

  console.log('workspaces found with changes:', workspaces.map(nameOnly));

  const existingWorkspaces = await asyncFilter(workspaces, ws =>
    fs.stat(ws).catch(() => false),
  );
  const existingWorkspaceNames = existingWorkspaces.map(nameOnly);

  console.log('workspaces that exist:', existingWorkspaceNames);

  // Automatically detect the supported Node versions from package.json
  const workspaceNodeMatrix = await Promise.all(
    existingWorkspaces.map(async fullPath => {
      const nodeString = JSON.parse(await fs.readFile(fullPath)).engines.node;
      if (!nodeString) {
        throw new Error(`No node engine specified in ${fullPath}`);
      }
      const nodeVersions = nodeString.split('||').map(v => v.trim());
      const workspace = nameOnly(fullPath);
      console.log(
        `Detected node versions for workspace ${workspace}:`,
        nodeVersions,
      );
      return nodeVersions.map(nodeVersion => ({
        workspace,
        // Convert versions like "18" to "18.x" for GitHub matrix usage
        nodeVersion: `${nodeVersion}${/^\d\d$/.test(nodeVersion) ? '.x' : ''}`,
      }));
    }),
  );
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `workspaces=${JSON.stringify(existingWorkspaceNames)}${EOL}`,
  );
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `workspace_node_matrix=${JSON.stringify(workspaceNodeMatrix.flat())}${EOL}`,
  );
}

if (import.meta.main) {
  main().catch(error => {
    console.error(error.stack);
    process.exit(1);
  });
}
