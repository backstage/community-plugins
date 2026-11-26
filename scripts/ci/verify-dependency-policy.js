#!/usr/bin/env node
/*
 * Copyright 2026 The Backstage Authors
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

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import semver from 'semver';

// Restrictions that Renovate alone cannot enforce for manual or transitive updates.
const policies = [
  { packageName: '@remixicon/react', allowedVersions: '<4.9.0' },
];
const dependencyFields = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'resolutions',
];

function checkManifest(manifest, path) {
  const errors = [];
  for (const { packageName, allowedVersions } of policies) {
    for (const field of dependencyFields) {
      const range = manifest[field]?.[packageName];
      if (range === undefined) continue;
      try {
        if (semver.subset(range, allowedVersions)) continue;
      } catch {
        // Invalid or non-semver ranges cannot establish that the package is safe.
      }
      errors.push(
        `${path}: ${field}.${packageName} (${range}) must be restricted to ${allowedVersions}`,
      );
    }
  }
  return errors;
}

function checkLockfile(lockfile, path) {
  const errors = [];
  for (const [descriptor, entry] of Object.entries(yaml.load(lockfile))) {
    for (const { packageName, allowedVersions } of policies) {
      if (
        !descriptor.startsWith(`${packageName}@`) &&
        !entry?.resolution?.startsWith(`${packageName}@`)
      )
        continue;
      const resolutionPrefix = `${packageName}@npm:`;
      const resolvedVersion = entry?.resolution?.startsWith(resolutionPrefix)
        ? entry.resolution.slice(resolutionPrefix.length)
        : undefined;
      if (
        !semver.valid(entry?.version) ||
        !semver.satisfies(entry.version, allowedVersions) ||
        !semver.valid(resolvedVersion) ||
        !semver.satisfies(resolvedVersion, allowedVersions)
      ) {
        errors.push(
          `${path}: ${descriptor} resolves to ${entry?.version ?? 'an unknown version'} (must be ${allowedVersions})`,
        );
      }
    }
  }
  return errors;
}

function main() {
  const workspace = process.argv[2];
  if (!workspace || !/^[\w-]+$/.test(workspace) || process.argv.length !== 3) {
    throw new Error(
      'Usage: node scripts/ci/verify-dependency-policy.js <workspace-name>',
    );
  }

  const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
  const workspacePath = `workspaces/${workspace}`;
  const files = execFileSync('git', ['ls-files', '-z', '--', workspacePath], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).split('\0');
  const manifests = files.filter(file => file.endsWith('/package.json'));
  if (!manifests.length) {
    throw new Error(`No package.json files found in ${workspacePath}`);
  }

  const errors = manifests.flatMap(file =>
    checkManifest(JSON.parse(readFileSync(join(repoRoot, file), 'utf8')), file),
  );
  const lockfilePath = `${workspacePath}/yarn.lock`;
  errors.push(
    ...checkLockfile(
      readFileSync(join(repoRoot, lockfilePath), 'utf8'),
      lockfilePath,
    ),
  );

  if (errors.length) {
    console.error('Dependency version policy failed:');
    for (const error of errors) console.error(`  ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`${workspacePath}: dependency version policy passed`);
  }
}

main();
