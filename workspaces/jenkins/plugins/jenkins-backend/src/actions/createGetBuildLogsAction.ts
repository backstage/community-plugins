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
import { stringifyEntityRef } from '@backstage/catalog-model';
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';

/**
 * Registers the `jenkins:get-build-logs` action with the ActionsRegistryService.
 *
 * @public
 */
export function createGetBuildLogsAction(options: {
  actionsRegistry: ActionsRegistryService;
  jenkinsInfoProvider: JenkinsInfoProvider;
  jenkinsApi: JenkinsApiImpl;
}) {
  const { actionsRegistry, jenkinsInfoProvider, jenkinsApi } = options;

  actionsRegistry.register({
    name: 'get-build-logs',
    title: 'Get Jenkins Build Console Logs',
    description: `
Fetches the full console output (stdout/stderr) of a specific Jenkins build.

The entity must have the \`jenkins.io/job-full-name\` annotation.
Use \`jenkins:list-builds\` to discover available job names and build numbers.

## Job full name format

Jobs are specified as path components separated by "/". Examples:
- \`my-pipeline\` — a top-level pipeline job
- \`my-folder/my-pipeline/main\` — a specific branch in a multi-branch pipeline

## When to use

Use this action when diagnosing a build failure and you need to read compiler errors,
test failures, or deployment logs captured during the build.

Note: Console output can be very long for large builds. Use the result to identify
the relevant failure message rather than processing the entire output.
`,
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the catalog entity.'),
          kind: z
            .string()
            .optional()
            .describe(
              'The kind of the catalog entity, e.g. "Component". Defaults to "Component" if omitted.',
            ),
          namespace: z
            .string()
            .optional()
            .describe(
              'The namespace of the catalog entity. Defaults to "default" if omitted.',
            ),
          jobFullName: z
            .string()
            .describe(
              'Full name of the Jenkins job, e.g. "my-folder/my-pipeline" or "my-folder/my-pipeline/main".',
            ),
          buildNumber: z
            .number()
            .int()
            .positive()
            .describe('The Jenkins build number whose logs to fetch.'),
        }),
      output: z =>
        z.object({
          consoleText: z
            .string()
            .describe('The full console output of the Jenkins build.'),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const entityRef = {
        kind: input.kind ?? 'Component',
        namespace: input.namespace ?? 'default',
        name: input.name,
      };

      logger.info(
        `Fetching console logs for Jenkins build #${input.buildNumber}, job "${
          input.jobFullName
        }", entity ${stringifyEntityRef(entityRef)}`,
      );

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef,
        credentials,
      });

      const jobs = input.jobFullName.split('/');
      const consoleText = await jenkinsApi.getBuildConsoleText(
        jenkinsInfo,
        jobs,
        input.buildNumber,
      );

      return {
        output: {
          consoleText,
        },
      };
    },
  });
}
