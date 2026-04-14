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

import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { JenkinsService } from '../service/jenkinsService';
import { sanitizeProject } from './sanitize';

export const createGetProjectsAction = ({
  actionsRegistry,
  jenkinsService,
}: {
  actionsRegistry: ActionsRegistryService;
  jenkinsService: JenkinsService;
}) => {
  actionsRegistry.register({
    name: 'get-projects',
    title: 'Get Jenkins Projects',
    description:
      'List Jenkins projects for a Backstage catalog entity, optionally filtered by branch name.',
    attributes: {
      readOnly: true,
      idempotent: true,
      destructive: false,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the catalog entity'),
          kind: z
            .string()
            .optional()
            .describe('The kind of the catalog entity'),
          namespace: z
            .string()
            .optional()
            .describe('The namespace of the catalog entity'),
          branches: z
            .string()
            .optional()
            .describe('Comma-separated branch names to filter by'),
        }),
      output: z =>
        z.object({
          projects: z.array(z.object({}).passthrough()),
        }),
    },
    action: async ({ input, credentials }) => {
      const result = await jenkinsService.getProjects({
        entityRef: {
          name: input.name,
          kind: input.kind,
          namespace: input.namespace,
        },
        branches: input.branches?.split(','),
        credentials,
      });
      return {
        output: {
          projects: result.projects.map(p => sanitizeProject(p)),
        },
      };
    },
  });
};
