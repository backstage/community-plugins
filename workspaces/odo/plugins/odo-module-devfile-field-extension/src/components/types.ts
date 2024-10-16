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
import { DevfileSelectorExtensionWithOptionsFieldSchema } from './schema';

export type DevfileSelectorExtensionWithOptionsProps =
  typeof DevfileSelectorExtensionWithOptionsFieldSchema.type;

export type StarterProject = string;

export type Version = {
  version: string;
  starterProjects: StarterProject[];
};

export type Devfile = {
  name: string;
  displayName: string | undefined;
  icon: string;
  versions: Version[];
};

export const EXAMPLE_STARTER_PROJECT: StarterProject = '' as const;

export const EXAMPLE_VERSION: Version = {
  version: '',
  starterProjects: [EXAMPLE_STARTER_PROJECT],
} as const;

export const EXAMPLE_DEVFILE: Devfile = {
  name: '',
  displayName: '',
  icon: '',
  versions: [EXAMPLE_VERSION],
} as const;
