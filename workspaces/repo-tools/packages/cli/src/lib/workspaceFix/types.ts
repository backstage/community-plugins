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

export type WorkspacePackage = {
  name: string;
  relativePath: string;
};

export type WorkspaceFixFlags = {
  publish: boolean;
  knip: boolean;
  check: boolean;
  plugin?: string;
};

export type WorkspaceFixConfig = {
  check: boolean;
  publish: boolean;
  knip: boolean;
  nodeOptions?: string;
  plugin: WorkspacePackage | null;
};

export type DetectedTools = {
  backstageCli: boolean;
  prettier: boolean;
  sortPackageJson: boolean;
  markdownlint?: string;
  knip: boolean;
};

export type FixStep = {
  id: string;
  required: boolean;
  available: boolean;
  skipReason?: string;
  command: string;
  args: string[];
  cwd?: string;
};

export type WorkspacePackageJson = {
  name?: string;
  workspaces?: unknown;
  workspaceFix?: {
    publish?: boolean;
    knip?: boolean;
    nodeOptions?: string;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
