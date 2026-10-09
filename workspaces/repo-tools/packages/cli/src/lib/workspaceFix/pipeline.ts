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

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, resolve } from 'node:path';

import { DEFAULT_NODE_OPTIONS, MEMORY_HEAVY_STEPS } from './constants';
import { workspaceFixError } from './errors';
import type { FixStep, WorkspaceFixConfig } from './types';

export function mergeNodeOptions(
  existing: string | undefined,
  additional: string | undefined,
  options: { overrideHeapLimit?: boolean } = {},
): string | undefined {
  const { overrideHeapLimit = false } = options;
  if (!additional) {
    return existing;
  }
  if (!existing) {
    return additional;
  }
  if (existing.includes('max-old-space-size')) {
    if (overrideHeapLimit) {
      const replacement = additional.match(/--max-old-space-size=\d+/)?.[0];
      if (replacement) {
        return existing.replace(/--max-old-space-size=\d+/, replacement);
      }
    }
    return existing;
  }
  return `${existing} ${additional}`.trim();
}

export function resolveSpawnEnv(
  step: FixStep,
  config: WorkspaceFixConfig,
  baseEnv: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const extra =
    config.nodeOptions ??
    (MEMORY_HEAVY_STEPS.has(step.id) ? DEFAULT_NODE_OPTIONS : undefined);
  if (!extra) {
    return baseEnv;
  }
  return {
    ...baseEnv,
    NODE_OPTIONS: mergeNodeOptions(baseEnv.NODE_OPTIONS, extra, {
      overrideHeapLimit: Boolean(config.nodeOptions),
    }),
  };
}

export function resolveStepSpawn(
  step: FixStep,
  cwd: string,
): { command: string; args: string[] } {
  if (step.command !== 'yarn' || step.args[0] === 'exec') {
    return { command: step.command, args: step.args };
  }

  const [name, ...rest] = step.args;
  const bin = resolve(cwd, 'node_modules', '.bin', name);
  if (existsSync(bin)) {
    return { command: bin, args: rest };
  }

  return { command: step.command, args: step.args };
}

function spawnStep(
  step: FixStep,
  cwd: string,
  config: WorkspaceFixConfig,
): Promise<number> {
  const runCwd = step.cwd ?? cwd;
  const { command, args } = resolveStepSpawn(step, runCwd);
  const env = resolveSpawnEnv(step, config);
  const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
  const localBin = resolve(cwd, 'node_modules', '.bin');
  const basePath = env[pathKey] ?? process.env[pathKey] ?? '';
  return new Promise(resolvePromise => {
    const child = spawn(command, args, {
      cwd: runCwd,
      stdio: 'inherit',
      env: {
        ...env,
        [pathKey]: `${localBin}${delimiter}${basePath}`,
      },
    });
    child.on('error', () => resolvePromise(1));
    child.on('close', code => resolvePromise(code ?? 1));
  });
}

export async function runPipeline(
  steps: FixStep[],
  {
    run,
    log,
  }: {
    run: (step: FixStep) => Promise<number>;
    log: (message: string) => void;
  },
): Promise<void> {
  for (const step of steps) {
    if (!step.available) {
      if (step.required) {
        throw workspaceFixError(`Required fixer '${step.id}' is not available`);
      }
      log(`skip ${step.id}: ${step.skipReason ?? 'not installed'}`);
      continue;
    }

    log(`run ${step.id}: ${step.command} ${step.args.join(' ')}`);
    const code = await run(step);
    if (code !== 0) {
      throw workspaceFixError(
        `Fixer '${step.id}' failed with exit code ${code}`,
        code,
      );
    }
  }
}

export async function runWorkspaceFixPipeline(
  steps: FixStep[],
  cwd: string,
  config: WorkspaceFixConfig,
  log: (message: string) => void = console.log,
): Promise<void> {
  await runPipeline(steps, {
    log,
    run: step => spawnStep(step, cwd, config),
  });
}
