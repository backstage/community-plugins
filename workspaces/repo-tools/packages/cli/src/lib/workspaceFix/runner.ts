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

import { OptionValues } from 'commander';

import { runWorkspaceFixPipeline } from './pipeline';
import { buildSteps } from './steps';
import type { WorkspaceFixFlags } from './types';
import {
  assertWorkspaceRoot,
  detectTools,
  readPackageJson,
  resolveConfig,
} from './workspace';

export function flagsFromOptions(options: OptionValues): WorkspaceFixFlags {
  return {
    publish: Boolean(options.publish),
    knip: Boolean(options.knip),
    check: Boolean(options.check),
    plugin: options.plugin,
  };
}

export async function runWorkspaceFix(
  flags: WorkspaceFixFlags,
  cwd = process.cwd(),
): Promise<void> {
  const pkg = readPackageJson(cwd);
  assertWorkspaceRoot(pkg);
  const config = resolveConfig(pkg, flags, cwd);
  const tools = detectTools(pkg);
  const steps = buildSteps({ tools, config, cwd });
  await runWorkspaceFixPipeline(steps, cwd, config);
}
