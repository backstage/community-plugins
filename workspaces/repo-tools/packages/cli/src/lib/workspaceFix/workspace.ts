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

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  MARKDOWNLINT_PACKAGES,
  PACKAGE_ROOTS,
  REPO_ROOT_PACKAGE_NAME,
} from './constants';
import { workspaceFixError } from './errors';
import type {
  DetectedTools,
  WorkspaceFixConfig,
  WorkspaceFixFlags,
  WorkspacePackage,
  WorkspacePackageJson,
} from './types';

export function readPackageJson(cwd: string): WorkspacePackageJson {
  const pkgPath = resolve(cwd, 'package.json');
  if (!existsSync(pkgPath)) {
    throw workspaceFixError(
      `No package.json in ${cwd}. Run yarn fix from a workspace root (workspaces/<name>).`,
    );
  }
  return JSON.parse(readFileSync(pkgPath, 'utf8')) as WorkspacePackageJson;
}

export function assertWorkspaceRoot(pkg: WorkspacePackageJson): void {
  if (pkg.name === REPO_ROOT_PACKAGE_NAME) {
    throw workspaceFixError(
      'yarn fix is per workspace. cd into workspaces/<name> and run yarn fix there.',
    );
  }
  if (!pkg.workspaces) {
    throw workspaceFixError(
      'yarn fix must run from a workspace root that declares a workspaces field.',
    );
  }
}

export function listWorkspacePackages(cwd: string): WorkspacePackage[] {
  const packages: WorkspacePackage[] = [];
  for (const root of PACKAGE_ROOTS) {
    const base = resolve(cwd, root);
    if (!existsSync(base)) {
      continue;
    }
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const relativePath = `${root}/${entry.name}`;
      if (existsSync(resolve(cwd, relativePath, 'package.json'))) {
        packages.push({ name: entry.name, relativePath });
      }
    }
  }
  return packages.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export function resolvePluginTarget(
  cwd: string,
  query: string,
): WorkspacePackage {
  const packages = listWorkspacePackages(cwd);
  if (packages.length === 0) {
    throw workspaceFixError(
      'No plugins or packages found under plugins/ or packages/.',
    );
  }

  const normalized = query.replace(/^\.\//, '');
  const direct = packages.find(
    pkg =>
      pkg.name === normalized ||
      pkg.relativePath === normalized ||
      pkg.relativePath === `plugins/${normalized}` ||
      pkg.relativePath === `packages/${normalized}`,
  );
  if (direct) {
    return direct;
  }

  const suffixMatches = packages.filter(
    pkg => pkg.name === normalized || pkg.name.endsWith(`-${normalized}`),
  );
  if (suffixMatches.length === 1) {
    return suffixMatches[0];
  }
  if (suffixMatches.length > 1) {
    throw workspaceFixError(
      `Ambiguous plugin '${query}'. Matches: ${suffixMatches
        .map(pkg => pkg.relativePath)
        .join(', ')}. Use the full directory name.`,
    );
  }

  const known = packages.map(pkg => pkg.relativePath).join(', ');
  throw workspaceFixError(
    `Unknown plugin '${query}'. Expected a name like segment or a path like plugins/analytics-provider-segment. Known packages: ${known}`,
  );
}

export function resolveConfig(
  pkg: WorkspacePackageJson,
  flags: WorkspaceFixFlags,
  cwd: string,
): WorkspaceFixConfig {
  const fromPkg = pkg.workspaceFix ?? {};
  const plugin = flags.plugin ? resolvePluginTarget(cwd, flags.plugin) : null;
  return {
    check: Boolean(flags.check),
    publish: Boolean(fromPkg.publish || flags.publish),
    knip: Boolean(fromPkg.knip || flags.knip),
    nodeOptions: fromPkg.nodeOptions,
    plugin,
  };
}

export function detectTools(pkg: WorkspacePackageJson): DetectedTools {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const markdownlintPkg = MARKDOWNLINT_PACKAGES.find(name => name in deps);
  return {
    backstageCli: '@backstage/cli' in deps,
    prettier: 'prettier' in deps,
    sortPackageJson: 'sort-package-json' in deps,
    markdownlint: markdownlintPkg,
    knip: 'knip' in deps,
  };
}
