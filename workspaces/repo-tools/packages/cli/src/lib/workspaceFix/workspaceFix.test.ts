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

import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  DEFAULT_NODE_OPTIONS,
  FIXER_ORDER,
  REPO_ROOT_PACKAGE_NAME,
} from './constants';
import {
  mergeNodeOptions,
  resolveSpawnEnv,
  resolveStepSpawn,
  runPipeline,
} from './pipeline';
import { buildSteps } from './steps';
import {
  assertWorkspaceRoot,
  detectTools,
  listWorkspacePackages,
  readPackageJson,
  resolveConfig,
  resolvePluginTarget,
} from './workspace';

const ALL_TOOLS = {
  backstageCli: true,
  prettier: true,
  sortPackageJson: true,
  markdownlint: 'markdownlint-cli',
  knip: true,
};

describe('workspace fix', () => {
  it('fixer order is documented and stable', () => {
    expect(FIXER_ORDER).toEqual([
      'repo-fix',
      'sort-package-json',
      'lint-fix',
      'markdownlint',
      'prettier',
      'knip',
    ]);
  });

  it('assertWorkspaceRoot rejects the monorepo root', () => {
    expect(() =>
      assertWorkspaceRoot({ name: REPO_ROOT_PACKAGE_NAME, workspaces: {} }),
    ).toThrow(/per workspace/);
  });

  it('assertWorkspaceRoot rejects a package without workspaces', () => {
    expect(() => assertWorkspaceRoot({ name: '@internal/noop' })).toThrow(
      /workspaces field/,
    );
  });

  it('readPackageJson fails without package.json', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'workspace-fix-'));
    expect(() => readPackageJson(cwd)).toThrow(/No package.json/);
  });

  it('resolveConfig merges package.json with CLI flags', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'workspace-fix-config-'));
    mkdirSync(join(cwd, 'plugins', 'segment'), { recursive: true });
    writeFileSync(join(cwd, 'plugins', 'segment', 'package.json'), '{}');
    expect(
      resolveConfig(
        { workspaceFix: { publish: true } },
        { check: true, knip: true, publish: false, plugin: 'segment' },
        cwd,
      ),
    ).toEqual({
      check: true,
      publish: true,
      knip: true,
      nodeOptions: undefined,
      plugin: { name: 'segment', relativePath: 'plugins/segment' },
    });
  });

  it('resolvePluginTarget matches a short plugin suffix', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'workspace-fix-plugin-'));
    mkdirSync(join(cwd, 'plugins', 'analytics-provider-segment'), {
      recursive: true,
    });
    mkdirSync(join(cwd, 'plugins', 'analytics-module-ga4'), {
      recursive: true,
    });
    writeFileSync(
      join(cwd, 'plugins', 'analytics-provider-segment', 'package.json'),
      '{}',
    );
    writeFileSync(
      join(cwd, 'plugins', 'analytics-module-ga4', 'package.json'),
      '{}',
    );

    expect(resolvePluginTarget(cwd, 'segment')).toEqual({
      name: 'analytics-provider-segment',
      relativePath: 'plugins/analytics-provider-segment',
    });
    expect(listWorkspacePackages(cwd).map(pkg => pkg.relativePath)).toEqual([
      'plugins/analytics-module-ga4',
      'plugins/analytics-provider-segment',
    ]);
  });

  it('resolvePluginTarget rejects ambiguous short names', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'workspace-fix-ambiguous-'));
    for (const name of ['foo-plugin-a', 'bar-plugin-a']) {
      mkdirSync(join(cwd, 'plugins', name), { recursive: true });
      writeFileSync(join(cwd, 'plugins', name, 'package.json'), '{}');
    }
    expect(() => resolvePluginTarget(cwd, 'a')).toThrow(/Ambiguous plugin 'a'/);
  });

  it('mergeNodeOptions preserves an existing heap limit', () => {
    expect(
      mergeNodeOptions('--max-old-space-size=16384', DEFAULT_NODE_OPTIONS),
    ).toBe('--max-old-space-size=16384');
  });

  it('mergeNodeOptions appends when existing lacks a heap limit', () => {
    expect(mergeNodeOptions('--inspect', DEFAULT_NODE_OPTIONS)).toBe(
      '--inspect --max-old-space-size=8192',
    );
  });

  it('mergeNodeOptions replaces heap limit for workspace overrides', () => {
    expect(
      mergeNodeOptions(
        '--max-old-space-size=8192',
        '--max-old-space-size=16384',
        { overrideHeapLimit: true },
      ),
    ).toBe('--max-old-space-size=16384');
  });

  it('resolveSpawnEnv sets NODE_OPTIONS for lint-fix', () => {
    const env = resolveSpawnEnv(
      {
        id: 'lint-fix',
        required: true,
        available: true,
        command: 'yarn',
        args: [],
      },
      resolveConfig(
        {},
        { publish: false, knip: false, check: false },
        process.cwd(),
      ),
      {},
    );
    expect(env.NODE_OPTIONS).toBe(DEFAULT_NODE_OPTIONS);
  });

  it('resolveSpawnEnv honors workspaceFix.nodeOptions', () => {
    const env = resolveSpawnEnv(
      {
        id: 'lint-fix',
        required: true,
        available: true,
        command: 'yarn',
        args: [],
      },
      resolveConfig(
        { workspaceFix: { nodeOptions: '--max-old-space-size=16384' } },
        { publish: false, knip: false, check: false },
        process.cwd(),
      ),
      {},
    );
    expect(env.NODE_OPTIONS).toBe('--max-old-space-size=16384');
  });

  it('resolveSpawnEnv lets workspaceFix.nodeOptions override CI NODE_OPTIONS', () => {
    const env = resolveSpawnEnv(
      {
        id: 'lint-fix',
        required: true,
        available: true,
        command: 'yarn',
        args: [],
      },
      resolveConfig(
        { workspaceFix: { nodeOptions: '--max-old-space-size=16384' } },
        { publish: false, knip: false, check: false },
        process.cwd(),
      ),
      { NODE_OPTIONS: DEFAULT_NODE_OPTIONS },
    );
    expect(env.NODE_OPTIONS).toBe('--max-old-space-size=16384');
  });

  it('resolveStepSpawn uses a local binary when yarn cannot resolve it', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'workspace-fix-bin-'));
    const binDir = join(cwd, 'node_modules', '.bin');
    mkdirSync(binDir, { recursive: true });
    writeFileSync(join(binDir, 'backstage-cli'), '#!/bin/sh\n');
    expect(
      resolveStepSpawn(
        {
          id: 'repo-fix',
          required: true,
          available: true,
          command: 'yarn',
          args: ['backstage-cli', 'repo', 'fix'],
        },
        cwd,
      ),
    ).toEqual({
      command: join(binDir, 'backstage-cli'),
      args: ['repo', 'fix'],
    });
  });

  it('resolveStepSpawn keeps yarn exec steps unchanged', () => {
    const step = {
      id: 'sort-package-json',
      required: false,
      available: true,
      command: 'yarn',
      args: ['exec', 'sort-package-json', 'package.json'],
    };
    expect(resolveStepSpawn(step, '/tmp')).toEqual({
      command: 'yarn',
      args: ['exec', 'sort-package-json', 'package.json'],
    });
  });

  it('detectTools reads workspace dependencies', () => {
    expect(
      detectTools({
        devDependencies: {
          '@backstage/cli': '^0.36.0',
          prettier: '^3.0.0',
          knip: '^5.0.0',
        },
      }),
    ).toEqual({
      backstageCli: true,
      prettier: true,
      sortPackageJson: false,
      markdownlint: undefined,
      knip: true,
    });
  });

  it('buildSteps keeps documented order and default knip off', () => {
    const steps = buildSteps({
      tools: ALL_TOOLS,
      config: { check: false, publish: false, knip: false, plugin: null },
    });
    expect(steps.map(step => step.id)).toEqual(FIXER_ORDER);
    const knip = steps.find(step => step.id === 'knip');
    expect(knip?.available).toBe(false);
    expect(knip?.skipReason).toMatch(/opt-in/);

    const repoFix = steps.find(step => step.id === 'repo-fix');
    expect(repoFix?.args).toEqual(['backstage-cli', 'repo', 'fix']);
  });

  it('buildSteps scopes lint and prettier when --plugin is set', () => {
    const plugin = {
      name: 'analytics-provider-segment',
      relativePath: 'plugins/analytics-provider-segment',
    };
    const steps = buildSteps({
      tools: ALL_TOOLS,
      config: { check: false, publish: false, knip: false, plugin },
      cwd: '/tmp/workspace',
    });
    expect(steps.find(step => step.id === 'lint-fix')?.args).toEqual([
      'backstage-cli',
      'package',
      'lint',
      '--fix',
      'plugins/analytics-provider-segment',
    ]);
    expect(steps.find(step => step.id === 'prettier')?.args).toEqual([
      'prettier',
      '--write',
      'plugins/analytics-provider-segment',
    ]);
    expect(steps.find(step => step.id === 'sort-package-json')?.available).toBe(
      false,
    );
  });

  it('buildSteps passes --publish to repo fix and enables knip when opted in', () => {
    const steps = buildSteps({
      tools: ALL_TOOLS,
      config: { check: false, publish: true, knip: true, plugin: null },
    });
    expect(steps.find(step => step.id === 'repo-fix')?.args).toEqual([
      'backstage-cli',
      'repo',
      'fix',
      '--publish',
    ]);
    expect(steps.find(step => step.id === 'knip')?.available).toBe(true);
  });

  it('buildSteps in check mode only runs repo fix with --check', () => {
    const steps = buildSteps({
      tools: ALL_TOOLS,
      config: { check: true, publish: true, knip: true, plugin: null },
    });
    expect(steps.map(step => step.id)).toEqual(['repo-fix']);
    expect(steps[0].args).toEqual([
      'backstage-cli',
      'repo',
      'fix',
      '--check',
      '--publish',
    ]);
  });

  it('runPipeline in check mode only runs repo fix', async () => {
    const ran: string[] = [];
    await runPipeline(
      buildSteps({
        tools: ALL_TOOLS,
        config: { check: true, publish: false, knip: true, plugin: null },
      }),
      {
        log: () => {},
        run: async step => {
          ran.push(step.id);
          return 0;
        },
      },
    );
    expect(ran).toEqual(['repo-fix']);
  });

  it('optional fixers are skipped when their packages are not installed', () => {
    const steps = buildSteps({
      tools: {
        backstageCli: true,
        prettier: false,
        sortPackageJson: false,
        markdownlint: undefined,
        knip: false,
      },
      config: { check: false, publish: false, knip: false, plugin: null },
    });
    expect(steps.find(step => step.id === 'sort-package-json')?.available).toBe(
      false,
    );
    expect(steps.find(step => step.id === 'markdownlint')?.available).toBe(
      false,
    );
    expect(steps.find(step => step.id === 'prettier')?.available).toBe(false);
  });

  it('runPipeline skips optional missing fixers and still succeeds', async () => {
    const ran: string[] = [];
    const logs: string[] = [];
    await runPipeline(
      buildSteps({
        tools: {
          backstageCli: true,
          prettier: true,
          sortPackageJson: false,
          markdownlint: undefined,
          knip: true,
        },
        config: { check: false, publish: false, knip: false, plugin: null },
      }),
      {
        log: msg => logs.push(msg),
        run: async step => {
          ran.push(step.id);
          return 0;
        },
      },
    );
    expect(ran).toEqual(['repo-fix', 'lint-fix', 'prettier']);
    expect(logs.some(line => line.startsWith('skip sort-package-json'))).toBe(
      true,
    );
    expect(logs.some(line => line.startsWith('skip knip'))).toBe(true);
  });

  it('runPipeline exits non-zero when a fixer fails', async () => {
    await expect(
      runPipeline(
        buildSteps({
          tools: ALL_TOOLS,
          config: { check: false, publish: false, knip: false, plugin: null },
        }),
        {
          log: () => {},
          run: async step => (step.id === 'lint-fix' ? 2 : 0),
        },
      ),
    ).rejects.toThrow(/lint-fix/);
  });

  it('runPipeline fails when a required fixer is missing', async () => {
    await expect(
      runPipeline(
        buildSteps({
          tools: {
            backstageCli: false,
            prettier: true,
            sortPackageJson: false,
            markdownlint: undefined,
            knip: false,
          },
          config: { check: false, publish: false, knip: false, plugin: null },
        }),
        { log: () => {}, run: async () => 0 },
      ),
    ).rejects.toThrow(/Required fixer 'repo-fix'/);
  });

  it('runPipeline succeeds when fixers report changes as success', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'workspace-fix-pkg-'));
    writeFileSync(
      join(cwd, 'package.json'),
      JSON.stringify({
        name: '@internal/example',
        workspaces: { packages: ['packages/*'] },
        devDependencies: { '@backstage/cli': '1.0.0', prettier: '3.0.0' },
      }),
    );
    const pkg = readPackageJson(cwd);
    assertWorkspaceRoot(pkg);
    const ran: string[] = [];
    await runPipeline(
      buildSteps({
        tools: detectTools(pkg),
        config: resolveConfig(
          pkg,
          {
            publish: false,
            knip: false,
            check: false,
          },
          cwd,
        ),
      }),
      {
        log: () => {},
        run: async step => {
          ran.push(step.id);
          return 0;
        },
      },
    );
    expect(ran).toEqual(['repo-fix', 'lint-fix', 'prettier']);
  });
});
