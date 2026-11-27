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

import { promisify } from 'util';
import { execFile as execFileOriginal } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

const execFile = promisify(execFileOriginal);

// Dependency sections that affect consumers of a published package
export const PRODUCTION_SECTIONS = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
];
export const ALL_SECTIONS = [...PRODUCTION_SECTIONS, 'devDependencies'];

const VALID_MODES = ['all', 'production', false];

/**
 * Resolves the `dependencyChangesets` mode from a parsed bcp.json (or
 * undefined when the workspace has none). An omitted flag keeps the
 * historical behaviour of generating changesets for every dependency bump.
 */
export function resolveChangesetMode(bcpConfig) {
  const value = bcpConfig?.dependencyChangesets;
  if (value === undefined) {
    return 'all';
  }
  if (!VALID_MODES.includes(value)) {
    console.warn(
      `Unknown dependencyChangesets value ${JSON.stringify(
        value,
      )}, falling back to "all"`,
    );
    return 'all';
  }
  return value;
}

/**
 * Returns the dependencies that were added or changed between two parsed
 * package.json files, limited to the sections relevant for the given mode.
 */
export function getDependencyBumps(before, after, mode) {
  const sections = mode === 'production' ? PRODUCTION_SECTIONS : ALL_SECTIONS;
  const bumps = new Map();
  for (const section of sections) {
    const previous = before?.[section] ?? {};
    for (const [name, version] of Object.entries(after?.[section] ?? {})) {
      if (previous[name] !== version) {
        bumps.set(name, version);
      }
    }
  }
  return bumps;
}

/**
 * Returns the workspace name for a published plugin package.json path, or
 * undefined if the path is not a workspace plugin package.json.
 */
export function getWorkspaceName(file) {
  const match = file.match(
    /^workspaces\/([^/]+)\/plugins\/[^/]+\/package\.json$/,
  );
  return match?.[1];
}

export function renderChangeset(packageNames, bumps) {
  const pkgs = packageNames.map(pkg => `'${pkg}': patch`).join('\n');
  const message = [...bumps]
    .map(([pkg, version]) => `Updated dependency \`${pkg}\` to \`${version}\`.`)
    .join('\n');
  return `---\n${pkgs}\n---\n\n${message}\n`;
}

async function git(...args) {
  const { stdout } = await execFile('git', args);
  return stdout;
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function readPreviousJson(file) {
  try {
    return JSON.parse(await git('show', `HEAD~1:${file}`));
  } catch {
    // File is new in this commit
    return undefined;
  }
}

async function main() {
  console.log('Generating changesets for package.json dependency bumps...');
  const diffFiles = (await git('diff', '--name-only', 'HEAD~1'))
    .split('\n')
    .filter(Boolean);

  if (diffFiles.some(f => path.matchesGlob(f, 'workspaces/*/.changeset/*'))) {
    console.log('Changeset already exists, skipping');
    return;
  }

  // Group changed plugin package.json files by workspace
  const filesByWorkspace = new Map();
  for (const file of diffFiles) {
    const workspace = getWorkspaceName(file);
    if (workspace) {
      filesByWorkspace.set(workspace, [
        ...(filesByWorkspace.get(workspace) ?? []),
        file,
      ]);
    }
  }
  if (!filesByWorkspace.size) {
    console.log('No plugin package.json changes found, skipping');
    return;
  }

  const shortHash = (await git('rev-parse', '--short', 'HEAD')).trim();
  const created = [];

  for (const [workspace, files] of filesByWorkspace) {
    const bcpConfig = await readJson(`workspaces/${workspace}/bcp.json`);
    const mode = resolveChangesetMode(bcpConfig);
    if (mode === false) {
      console.log(`[${workspace}] dependencyChangesets disabled, skipping`);
      continue;
    }

    const packageNames = [];
    const bumps = new Map();
    for (const file of files) {
      const after = await readJson(file);
      if (!after || after.private) {
        continue;
      }
      const packageBumps = getDependencyBumps(
        await readPreviousJson(file),
        after,
        mode,
      );
      if (packageBumps.size) {
        packageNames.push(after.name);
        for (const [name, version] of packageBumps) {
          bumps.set(name, version);
        }
      }
    }

    if (!packageNames.length) {
      console.log(
        `[${workspace}] No ${
          mode === 'production' ? 'production ' : ''
        }dependency bumps in published packages, skipping`,
      );
      continue;
    }

    const fileName = `workspaces/${workspace}/.changeset/renovate-${shortHash}.md`;
    console.log(`[${workspace}] Creating changeset ${fileName}`);
    await fs.writeFile(fileName, renderChangeset(packageNames, bumps));
    await git('add', fileName);
    created.push(fileName);
  }

  // Committing and pushing is left to the workflow so it can be combined with
  // other staged changes such as lockfile dedupes
  console.log(
    created.length
      ? `Staged ${created.length} changeset(s) for commit ${shortHash}`
      : 'No changesets needed',
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error.stack || error);
    process.exit(1);
  });
}
