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
 * Registers the `argocd:list-applications` action.
 * @internal
 */
export function createListApplicationsAction(options: {
  actionsRegistry: ActionsRegistryService;
  argoCDService: ArgoCDService;
  permissions: PermissionsService;
}) {
  const { actionsRegistry, argoCDService, permissions } = options;

  actionsRegistry.register({
    name: 'argocd:list-applications',
    title: 'List ArgoCD Applications',
    description:
      'List ArgoCD applications on a specific instance, optionally filtered by label selector, project or namespace. Returns sync and health status for each app.',
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    visibilityPermission: argocdViewPermission,
    schema: {
      input: z =>
        z.object({
          instanceName: z
            .string()
            .describe(
              'Name of the ArgoCD instance as configured in argocd.appLocatorMethods[].instances',
            ),
          selector: z
            .string()
            .optional()
            .describe(
              'Label selector to filter applications, e.g. app.kubernetes.io/part-of=my-app',
            ),
          project: z
            .string()
            .optional()
            .describe('Filter by ArgoCD project name'),
          appNamespace: z
            .string()
            .optional()
            .describe('Filter by application namespace'),
        }),
      output: z =>
        z.object({
          totalCount: z.number(),
          applications: z.array(
            z.object({
              name: z.string(),
              namespace: z.string().optional(),
              project: z.string().optional(),
              syncStatus: z.string(),
              healthStatus: z.string(),
              revision: z.string().optional(),
              destination: z.object({
                server: z.string().optional(),
                namespace: z.string().optional(),
              }),
            }),
          ),
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
        `Listing ArgoCD applications on instance: ${input.instanceName}`,
      );

      const result = await argoCDService.listArgoApps(input.instanceName, {
        selector: input.selector,
        project: input.project,
        appNamespace: input.appNamespace,
      });

      const apps = result.items ?? [];

      return {
        output: {
          totalCount: apps.length,
          applications: apps.map(app => ({
            name: app.metadata.name ?? '',
            namespace: app.metadata.namespace,
            project: app.spec?.project,
            syncStatus: app.status?.sync?.status ?? 'Unknown',
            healthStatus: app.status?.health?.status ?? 'Unknown',
            revision: app.status?.sync?.revision,
            destination: {
              server: app.spec?.destination?.server,
              namespace: app.spec?.destination?.namespace,
            },
          })),
        },
      };
    },
  });
}
