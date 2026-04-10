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
 * Registers the `jenkins:list-builds` action with the ActionsRegistryService.
 *
 * @public
 */
export function createListBuildsAction(options: {
  actionsRegistry: ActionsRegistryService;
  jenkinsInfoProvider: JenkinsInfoProvider;
  jenkinsApi: JenkinsApiImpl;
}) {
  const { actionsRegistry, jenkinsInfoProvider, jenkinsApi } = options;

  actionsRegistry.register({
    name: 'list-builds',
    title: 'List Jenkins Builds',
    description: `
Lists all Jenkins builds (projects) configured for a Backstage catalog entity.

The entity must have the \`jenkins.io/job-full-name\` annotation pointing to the Jenkins job(s).
Each result represents a Jenkins job with its last build status.

## Build status values

- \`running\` — build is actively running
- \`queued\` — build is in the queue
- \`SUCCESS\` — last build passed
- \`FAILURE\` — last build failed
- \`UNSTABLE\` — last build is unstable
- \`ABORTED\` — last build was aborted
- \`build not found\` — no builds have run yet

## When to use

Use this action to get an overview of which Jenkins jobs are linked to a service and
what the current build state is. For detailed logs use \`jenkins:get-build-logs\`.
For re-triggering a build use \`jenkins:trigger-build\`.
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
          branch: z
            .string()
            .optional()
            .describe(
              'Optional branch name to filter builds for multi-branch pipelines.',
            ),
        }),
      output: z =>
        z.object({
          builds: z
            .array(
              z.object({
                name: z.string().describe('The full name of the Jenkins job.'),
                displayName: z
                  .string()
                  .describe('The display name of the Jenkins job.'),
                status: z
                  .string()
                  .describe(
                    'Current status of the job (e.g. SUCCESS, FAILURE, running, queued).',
                  ),
                inQueue: z
                  .boolean()
                  .describe('Whether the job is currently queued.'),
                lastBuild: z
                  .object({
                    number: z
                      .number()
                      .describe('The build number of the last build.'),
                    url: z.string().describe('URL to the last build.'),
                    result: z
                      .string()
                      .nullable()
                      .describe(
                        'Result of the last build (SUCCESS, FAILURE, etc.), or null if still running.',
                      ),
                    building: z
                      .boolean()
                      .describe('Whether the build is currently running.'),
                    timestamp: z
                      .number()
                      .describe(
                        'Unix timestamp (ms) of when the build started.',
                      ),
                    duration: z
                      .number()
                      .describe('Duration of the build in milliseconds.'),
                    displayName: z
                      .string()
                      .describe('Display name of the build.'),
                  })
                  .nullable()
                  .describe('Details of the last build, or null if none.'),
              }),
            )
            .describe('List of Jenkins jobs associated with the entity.'),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const entityRef = {
        kind: input.kind ?? 'Component',
        namespace: input.namespace ?? 'default',
        name: input.name,
      };

      logger.info(
        `Listing Jenkins builds for entity ${stringifyEntityRef(entityRef)}`,
      );

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef,
        credentials,
      });

      const branches = input.branch ? [input.branch] : undefined;
      const projects = await jenkinsApi.getProjects(jenkinsInfo, branches);

      return {
        output: {
          builds: projects.map(p => ({
            name: p.fullName,
            displayName: p.fullDisplayName,
            status: p.status,
            inQueue: p.inQueue,
            lastBuild: p.lastBuild
              ? {
                  number: p.lastBuild.number,
                  url: p.lastBuild.url,
                  result: p.lastBuild.result ?? null,
                  building: p.lastBuild.building,
                  timestamp: p.lastBuild.timestamp,
                  duration: p.lastBuild.duration,
                  displayName: p.lastBuild.displayName,
                }
              : null,
          })),
        },
      };
    },
  });
}
