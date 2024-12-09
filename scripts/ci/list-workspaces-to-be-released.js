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
import semver from 'semver';
import npmFetch from 'npm-registry-fetch';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const execFile = promisify(execFileCb);

async function main() {
  if (process.env.CI && typeof process.env.GITHUB_OUTPUT === 'undefined') {
    throw new Error('GITHUB_OUTPUT environment variable not set');
  }

  const repoRoot = resolvePath(__dirname, '..', '..');
  process.chdir(repoRoot);

  const workspacesWithChangesets = new Set(
    (await runPlain('ls workspaces/*/.changeset/*.md | grep -v README.md'))
      .split('\n')
      .map(path => path.match(/^workspaces\/([^/]+)\//)[1])
      .filter(Boolean),
  );

  workspacesWithChangesets.add('noop');

  const workspacesToBePublished = await findWorkspacesToBePublished();
  for (const workspace of workspacesToBePublished) {
    if (workspacesWithChangesets.has(workspace)) {
      workspacesToBePublished.delete(workspace);
    }
  }

  workspacesToBePublished.add('noop');

  const output = `workspaces_with_changesets=${JSON.stringify(
    Array.from(workspacesWithChangesets),
  )}${EOL}workspaces_to_be_published=${JSON.stringify(
    Array.from(workspacesToBePublished),
  )}${EOL}`;

  console.log(output);
  if (process.env.CI) {
    await fs.appendFile(process.env.GITHUB_OUTPUT, output);
  }
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});

async function findWorkspacesToBePublished() {
  const allPackages = (
    await runPlain(`ls workspaces/*/plugins/*/package.json`)
  ).split('\n');

  const workspacesWithChanges = new Set();

  for (let i = 0; i < allPackages.length; i++) {
    const progress = (((i + 1) / allPackages.length) * 100).toFixed(0);
    process.stdout.write(`Progress: ${progress}%\r`);

    const path = allPackages[i];
    const workspace = path.match(/^workspaces\/([^/]+)\//)[1];
    if (workspacesWithChanges.has(workspace)) {
      continue;
    }
    const pkgJson = JSON.parse(await fs.readFile(path, 'utf-8'));
    if (pkgJson.private) {
      continue;
    }

    try {
      const response = await npmFetch.json(pkgJson.name, {});
      const latestPublishedVersion = response['dist-tags'].latest;
      if (semver.gt(pkgJson.version, latestPublishedVersion)) {
        workspacesWithChanges.add(workspace);
      }
    } catch (e) {
      if (e.statusCode === 404) {
        console.info(`\nThe plugin ${pkgJson.name} was not found on npm.`);
        workspacesWithChanges.add(workspace);
      } else {
        console.error(
          `\nAn error occurred while checking for the latest version' of ${pkgJson.name}. Error: ${e}`,
        );
      }
    }
  }

  return workspacesWithChanges;
}

async function runPlain(cmd) {
  const [c, ...args] = cmd.split(' ');
  try {
    const { stdout } = await execFile(c, args, { shell: true });
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
