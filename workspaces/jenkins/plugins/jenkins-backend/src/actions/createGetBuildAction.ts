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
import { NotFoundError } from '@backstage/errors';
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';

/**
 * Registers the `jenkins:get-build` action with the ActionsRegistryService.
 *
 * @public
 */
export function createGetBuildAction(options: {
  actionsRegistry: ActionsRegistryService;
  jenkinsInfoProvider: JenkinsInfoProvider;
  jenkinsApi: JenkinsApiImpl;
}) {
  const { actionsRegistry, jenkinsInfoProvider, jenkinsApi } = options;

  actionsRegistry.register({
    name: 'get-build',
    title: 'Get Jenkins Build',
    description: `
Fetches details for a specific Jenkins build identified by job full name and build number.

The entity must have the \`jenkins.io/job-full-name\` annotation.
Use \`jenkins:list-builds\` to discover available job names and build numbers.

## Job full name format

Jobs are specified as path components separated by "/". Examples:
- \`my-pipeline\` — a top-level pipeline job
- \`my-folder/my-pipeline\` — a pipeline inside a folder
- \`my-folder/my-pipeline/main\` — a specific branch in a multi-branch pipeline

## When to use

Use this action to inspect the details of a particular build, including test results and SCM information.
For console output use \`jenkins:get-build-logs\`.
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
            .describe('The Jenkins build number to fetch.'),
        }),
      output: z =>
        z.object({
          number: z.number().describe('The build number.'),
          url: z.string().describe('URL to the build in Jenkins.'),
          displayName: z.string().describe('Display name of the build.'),
          fullDisplayName: z
            .string()
            .describe('Full display name of the build.'),
          result: z
            .string()
            .nullable()
            .describe(
              'Build result (SUCCESS, FAILURE, UNSTABLE, ABORTED), or null if still running.',
            ),
          building: z
            .boolean()
            .describe('Whether the build is currently running.'),
          status: z
            .string()
            .describe(
              'Computed status string (running, SUCCESS, FAILURE, unknown, etc.).',
            ),
          timestamp: z
            .number()
            .describe('Unix timestamp (ms) of when the build started.'),
          duration: z
            .number()
            .describe('Duration of the build in milliseconds.'),
          tests: z
            .object({
              passed: z.number().describe('Number of passing tests.'),
              skipped: z.number().describe('Number of skipped tests.'),
              failed: z.number().describe('Number of failed tests.'),
              total: z.number().describe('Total number of tests.'),
              testUrl: z.string().describe('URL to the test report.'),
            })
            .optional()
            .describe(
              'Test results for the build, or undefined if no test report is available.',
            ),
          source: z
            .object({
              branchName: z
                .string()
                .optional()
                .describe('The branch that triggered this build.'),
              commit: z
                .object({
                  hash: z.string().describe('Short commit hash.'),
                })
                .optional()
                .describe('Commit information.'),
              url: z.string().optional().describe('URL to the source.'),
              displayName: z
                .string()
                .optional()
                .describe('Display name of the source.'),
              author: z.string().optional().describe('Author of the commit.'),
            })
            .optional()
            .describe('SCM source information for this build.'),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const entityRef = {
        kind: input.kind ?? 'Component',
        namespace: input.namespace ?? 'default',
        name: input.name,
      };

      logger.info(
        `Fetching Jenkins build #${input.buildNumber} for job "${
          input.jobFullName
        }" on entity ${stringifyEntityRef(entityRef)}`,
      );

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef,
        fullJobNames: [input.jobFullName],
        credentials,
      });

      const jobs = input.jobFullName.split('/').map(s => encodeURIComponent(s));
      let build;
      try {
        build = await jenkinsApi.getBuild(jenkinsInfo, jobs, input.buildNumber);
      } catch (err) {
        throw new NotFoundError(
          `Build #${input.buildNumber} not found for job "${input.jobFullName}"`,
          err,
        );
      }

      return {
        output: {
          number: build.number,
          url: build.url,
          displayName: build.displayName,
          fullDisplayName: build.fullDisplayName,
          result: build.result ?? null,
          building: build.building,
          status: build.status,
          timestamp: build.timestamp,
          duration: build.duration,
          tests: build.tests,
          source: build.source,
        },
      };
    },
  });
}
