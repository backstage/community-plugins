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
import { NotAllowedError } from '@backstage/errors';
import { jenkinsExecutePermission } from '@backstage-community/plugin-jenkins-common';
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';

/**
 * Registers the `jenkins:trigger-build` action with the ActionsRegistryService.
 *
 * Requires the `jenkins.execute` permission. If the caller does not have
 * this permission, the action will return an authorization error.
 *
 * @public
 */
export function createTriggerBuildAction(options: {
  actionsRegistry: ActionsRegistryService;
  jenkinsInfoProvider: JenkinsInfoProvider;
  jenkinsApi: JenkinsApiImpl;
}) {
  const { actionsRegistry, jenkinsInfoProvider, jenkinsApi } = options;

  actionsRegistry.register({
    name: 'trigger-build',
    title: 'Trigger Jenkins Build',
    description: `
Re-triggers (replays) an existing Jenkins build identified by job name and build number.

This action requires the \`jenkins.execute\` permission. If the caller does not have
this permission, the action will fail with an authorization error.

The entity must have the \`jenkins.io/job-full-name\` annotation.
Use \`jenkins:list-builds\` to discover available job names and build numbers.

## Job full name format

Jobs are specified as path components separated by "/":
- \`my-pipeline\` — a top-level pipeline job
- \`my-folder/my-pipeline/main\` — a specific branch in a multi-branch pipeline

## When to use

Use this action to replay a failed or stale build. The action replays the build
using the same source and parameters as the original build number.

Do NOT use this action for continuous triggering — it is designed for one-off
retries during incident response or debugging.
`,
    attributes: {
      readOnly: false,
      destructive: false,
      idempotent: false,
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
              'Full name of the Jenkins job to trigger, e.g. "my-folder/my-pipeline/main".',
            ),
          buildNumber: z
            .number()
            .int()
            .positive()
            .describe('The Jenkins build number to replay.'),
        }),
      output: z =>
        z.object({
          status: z
            .number()
            .describe(
              'HTTP status code returned by Jenkins. A 201 indicates the rebuild was successfully queued.',
            ),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const entityRef = {
        kind: input.kind ?? 'Component',
        namespace: input.namespace ?? 'default',
        name: input.name,
      };
      const resourceRef = stringifyEntityRef(entityRef);

      logger.info(
        `Triggering Jenkins build replay for job "${input.jobFullName}" build #${input.buildNumber} on entity ${resourceRef}`,
      );

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef,
        fullJobNames: [input.jobFullName],
        credentials,
      });

      const jobs = input.jobFullName.split('/').map(s => encodeURIComponent(s));
      const status = await jenkinsApi.rebuildProject(
        jenkinsInfo,
        jobs,
        input.buildNumber,
        resourceRef,
        { credentials },
      );

      if (status === 403) {
        throw new NotAllowedError(
          `Permission denied: the caller does not have the '${jenkinsExecutePermission.name}' permission for entity "${resourceRef}"`,
        );
      }

      return {
        output: {
          status,
        },
      };
    },
  });
}
