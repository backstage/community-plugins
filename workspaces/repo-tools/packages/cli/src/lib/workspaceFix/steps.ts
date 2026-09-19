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

import { resolve } from 'node:path';

import type { DetectedTools, FixStep, WorkspaceFixConfig } from './types';

function lintFixArgs(config: WorkspaceFixConfig): string[] {
  if (config.plugin) {
    return [
      'backstage-cli',
      'package',
      'lint',
      '--fix',
      config.plugin.relativePath,
    ];
  }
  return ['backstage-cli', 'repo', 'lint', '--fix'];
}

function prettierArgs(config: WorkspaceFixConfig): string[] {
  return ['prettier', '--write', config.plugin?.relativePath ?? '.'];
}

function markdownlintArgs(
  packageName: string | undefined,
  config: WorkspaceFixConfig,
): string[] {
  const target = config.plugin
    ? `${config.plugin.relativePath}/**/*.md`
    : '**/*.md';
  if (packageName === 'markdownlint-cli2') {
    return ['exec', 'markdownlint-cli2', '--fix', target];
  }
  return ['exec', 'markdownlint', '--fix', target];
}

function repoFixArgs(config: WorkspaceFixConfig): string[] {
  return [
    'backstage-cli',
    'repo',
    'fix',
    ...(config.check ? ['--check'] : []),
    ...(config.publish ? ['--publish'] : []),
  ];
}

export function buildSteps({
  tools,
  config,
  cwd = process.cwd(),
}: {
  tools: DetectedTools;
  config: WorkspaceFixConfig;
  cwd?: string;
}): FixStep[] {
  const repoFixStep: FixStep = {
    id: 'repo-fix',
    required: true,
    available: tools.backstageCli,
    command: 'yarn',
    args: repoFixArgs(config),
  };

  if (config.check) {
    return [repoFixStep];
  }

  const steps: FixStep[] = [
    repoFixStep,
    {
      id: 'sort-package-json',
      required: false,
      available: Boolean(tools.sortPackageJson) && !config.plugin,
      skipReason: config.plugin
        ? 'sort-package-json runs on the workspace root only'
        : undefined,
      command: 'yarn',
      args: ['exec', 'sort-package-json', 'package.json'],
    },
    {
      id: 'lint-fix',
      required: true,
      available: tools.backstageCli,
      command: 'yarn',
      args: lintFixArgs(config),
    },
    {
      id: 'markdownlint',
      required: false,
      available: Boolean(tools.markdownlint),
      command: 'yarn',
      args: markdownlintArgs(tools.markdownlint, config),
    },
    {
      id: 'prettier',
      required: false,
      available: Boolean(tools.prettier),
      command: 'yarn',
      args: prettierArgs(config),
    },
    {
      id: 'knip',
      required: false,
      available: Boolean(tools.knip) && config.knip,
      skipReason: config.knip
        ? 'knip is not installed'
        : 'knip --fix is opt-in (set workspaceFix.knip or pass --knip)',
      command: 'yarn',
      args: ['knip', '--fix'],
      cwd: config.plugin ? resolve(cwd, config.plugin.relativePath) : undefined,
    },
  ];

  return steps;
}
