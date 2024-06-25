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
import { join } from 'path';
import { copy } from 'fs-extra';
import { execSync } from 'child_process';

// TODO: might be worth shipping our our template for create-app, especially if we decide
// to change the layout of the workspaces moving forward.
export const createWorkspace = async (opts: { name: string; cwd?: string }) => {
  const workspacePath = join(
    opts.cwd ?? process.cwd(),
    'workspaces',
    opts.name,
  );

  // eslint-disable-next-line no-restricted-syntax
  const templatePath = join(__dirname, 'templates', 'workspace');

  execSync(
    `npx @backstage/create-app --path ${workspacePath} --skip-install --template-path=${templatePath}`,
    { input: opts.name },
  );

  // experimental test
  // eslint-disable-next-line no-restricted-syntax
  await copy(join(__dirname, '.changeset'), join(workspacePath, '.changeset'));
};
