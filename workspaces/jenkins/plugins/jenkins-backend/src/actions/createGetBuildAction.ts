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
import { sanitizeBuild } from './sanitize';

export const createGetBuildAction = ({
  actionsRegistry,
  jenkinsService,
}: {
  actionsRegistry: ActionsRegistryService;
  jenkinsService: JenkinsService;
}) => {
  actionsRegistry.register({
    name: 'get-build',
    title: 'Get Jenkins Build',
    description:
      'Retrieve details of a specific Jenkins build, including status, test results, and source information.',
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
          jobFullName: z.string().describe('The full name of the Jenkins job'),
          buildNumber: z.number().describe('The build number to retrieve'),
        }),
      output: z =>
        z.object({
          build: z.object({}).passthrough(),
        }),
    },
    action: async ({ input, credentials }) => {
      const result = await jenkinsService.getBuild({
        entityRef: {
          name: input.name,
          kind: input.kind,
          namespace: input.namespace,
        },
        jobFullName: input.jobFullName,
        buildNumber: input.buildNumber,
        credentials,
      });
      return {
        output: {
          build: sanitizeBuild(result.build),
        },
      };
    },
  });
};
