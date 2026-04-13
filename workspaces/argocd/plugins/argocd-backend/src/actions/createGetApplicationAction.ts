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
 * Registers the `argocd:get-application` action.
 * @internal
 */
export function createGetApplicationAction(options: {
  actionsRegistry: ActionsRegistryService;
  argoCDService: ArgoCDService;
  permissions: PermissionsService;
}) {
  const { actionsRegistry, argoCDService, permissions } = options;

  actionsRegistry.register({
    name: 'argocd:get-application',
    title: 'Get ArgoCD Application',
    description:
      'Get full details of a specific ArgoCD application from a named instance, including sync status, health, resources, and operation state.',
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
          appName: z.string().describe('ArgoCD application name'),
          appNamespace: z
            .string()
            .optional()
            .describe('Namespace of the application'),
          project: z.string().optional().describe('ArgoCD project name'),
        }),
      output: z =>
        z.object({
          name: z.string(),
          namespace: z.string().optional(),
          project: z.string().optional(),
          syncStatus: z.string(),
          healthStatus: z.string(),
          revision: z.string().optional(),
          operationPhase: z.string().optional(),
          operationMessage: z.string().optional(),
          destination: z.object({
            server: z.string().optional(),
            namespace: z.string().optional(),
          }),
          resourcesCount: z.number().describe('Number of managed resources'),
          historyCount: z.number().describe('Number of deploy history entries'),
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
        `Getting ArgoCD application ${input.appName} from instance ${input.instanceName}`,
      );

      const app = await argoCDService.getApplication(input.instanceName, {
        appName: input.appName,
        appNamespace: input.appNamespace,
        project: input.project,
      });

      return {
        output: {
          name: app.metadata.name ?? '',
          namespace: app.metadata.namespace,
          project: app.spec?.project,
          syncStatus: app.status?.sync?.status ?? 'Unknown',
          healthStatus: app.status?.health?.status ?? 'Unknown',
          revision: app.status?.sync?.revision,
          operationPhase: app.status?.operationState?.phase,
          operationMessage: app.status?.operationState?.message,
          destination: {
            server: app.spec?.destination?.server,
            namespace: app.spec?.destination?.namespace,
          },
          resourcesCount: app.status?.resources?.length ?? 0,
          historyCount: app.status?.history?.length ?? 0,
        },
      };
    },
  });
}
