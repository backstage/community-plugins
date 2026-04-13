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
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { PermissionsService } from '@backstage/backend-plugin-api';
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { argocdViewPermission } from '@backstage-community/plugin-argocd-common';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

/**
 * Registers the `argocd:get-revision-details` action.
 * @internal
 */
export function createGetRevisionDetailsAction(options: {
  actionsRegistry: ActionsRegistryService;
  argoCDService: ArgoCDService;
  permissions: PermissionsService;
}) {
  const { actionsRegistry, argoCDService, permissions } = options;

  actionsRegistry.register({
    name: 'argocd:get-revision-details',
    title: 'Get ArgoCD Revision Details',
    description:
      'Fetch the Git commit metadata (author, date, message) for a specific revision of an ArgoCD application deployment.',
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    visibilityPermission: argocdViewPermission,
    schema: {
      input: z =>
        z.object({
          instanceName: z.string().describe('Name of the ArgoCD instance'),
          appName: z.string().describe('ArgoCD application name'),
          revisionID: z
            .string()
            .describe('Git commit SHA or tag to get details for'),
          appNamespace: z
            .string()
            .optional()
            .describe('Namespace of the application'),
        }),
      output: z =>
        z.object({
          author: z.string(),
          date: z.string(),
          message: z.string(),
          revisionID: z.string().optional(),
        }),
    },
    async action({ input, credentials, logger }) {
      const decision = await permissions.authorize(
        [{ permission: argocdViewPermission }],
        { credentials },
      );
      if (decision[0].result === AuthorizeResult.DENY) {
        throw new NotAllowedError(
          'Unauthorized: missing argocd.view.read permission',
        );
      }

      logger.debug(
        `Getting revision details for app ${input.appName}, revision ${input.revisionID}`,
      );

      const revision = await argoCDService.getRevisionDetails(
        input.instanceName,
        input.appName,
        input.revisionID,
        { appNamespace: input.appNamespace },
      );

      return {
        output: {
          author: revision.author,
          date:
            revision.date instanceof Date
              ? revision.date.toISOString()
              : String(revision.date),
          message: revision.message,
          revisionID: revision.revisionID,
        },
      };
    },
  });
}
