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
 * Registers the `argocd:find-applications` action.
 * @internal
 */
export function createFindApplicationsAction(options: {
  actionsRegistry: ActionsRegistryService;
  argoCDService: ArgoCDService;
  permissions: PermissionsService;
}) {
  const { actionsRegistry, argoCDService, permissions } = options;

  actionsRegistry.register({
    name: 'argocd:find-applications',
    title: 'Find ArgoCD Applications',
    description:
      'Find all ArgoCD applications across all configured instances by application name. Returns sync status, health, and deployment details. Use the app name from the catalog entity annotation `argocd/app-name`.',
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    visibilityPermission: argocdViewPermission,
    schema: {
      input: z =>
        z.object({
          appName: z.string().describe('ArgoCD application name to search for'),
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
          instances: z.array(
            z.object({
              instanceName: z.string(),
              instanceUrl: z.string(),
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

      logger.debug(`Finding ArgoCD applications with name: ${input.appName}`);

      const results = await argoCDService.findApplications({
        appName: input.appName,
        project: input.project,
        appNamespace: input.appNamespace,
        expand: 'applications',
      });

      return {
        output: {
          instances: results.map(r => ({
            instanceName: r.name,
            instanceUrl: r.url,
            applications: (r.applications ?? []).map(app => ({
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
          })),
        },
      };
    },
  });
}
