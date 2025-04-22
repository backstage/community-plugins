/*
 * Copyright 2025 The Backstage Authors
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

import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Create Dotnet Project',
    example: yaml.stringify({
      steps: [
        {
          id: 'createDotnetProject',
          action: 'dotnet:new',
          name: 'Create New webapi Project',
          input: {
            template: 'webapi',
          },
        },
      ],
    }),
  },
  {
    description: 'Create new dotnet project with arguments',
    example: yaml.stringify({
      steps: [
        {
          id: 'createDotnetProject',
          action: 'dotnet:new',
          name: 'Create New webapi Project with name',
          input: {
            template: 'webapi',
            args: ['-n', 'myProjectName'],
          },
        },
      ],
    }),
  },
  {
    description: 'Create a new project to a specific path',
    example: yaml.stringify({
      steps: [
        {
          id: 'createDotnetProject',
          action: 'dotnet:new',
          name: 'Create New webapi Project',
          input: {
            template: 'webapi',
            targetPath: '/my/path',
          },
        },
      ],
    }),
  },
  {
    description: 'Create a new project with arguments and target path',
    example: yaml.stringify({
      steps: [
        {
          id: 'createDotnetProject',
          action: 'dotnet:new',
          name: 'Create New webapi Project with name and target path',
          input: {
            template: 'webapi',
            args: ['-n', 'myProjectName'],
            targetPath: '/my/path',
          },
        },
      ],
    }),
  },
];
