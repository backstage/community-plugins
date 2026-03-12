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
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

/**
 * Registers the ArgoCD create-resources action with the Actions API.
 * @public
 */
export function createArgoCDResourceAction(options: {
  actionsRegistry: ActionsRegistryService;
  config: RootConfigService;
  logger: LoggerService;
}) {
  const { actionsRegistry, config, logger } = options;

  actionsRegistry.register({
    name: 'create-resources',
    title: 'Create ArgoCD Resources',
    description: 'Creates ArgoCD resources',
    schema: {
      input: z =>
        z.object({
          appName: z
            .string()
            .describe('The name of the application to be created'),
          argoInstance: z.string().describe('The name of the Argo CD Instance'),
          namespace: z
            .string()
            .describe('The namespace Argo CD will use for resource deployment'),
          repoUrl: z
            .string()
            .describe(
              'The Repo URL that will be used in the Argo CD project and application',
            ),
          path: z
            .string()
            .describe(
              'The path of the resources in the repository that Argo CD will watch',
            ),
          label: z
            .string()
            .describe('The label used by Backstage to find applications')
            .optional(),
          projectName: z
            .string()
            .describe(
              'The name of the project. By default the application name is used.',
            )
            .optional(),
        }),
      output: z =>
        z.object({
          applicationUrl: z
            .string()
            .describe('The URL to the ArgoCD application'),
        }),
    },
    attributes: {
      destructive: false,
      idempotent: false,
      readOnly: false,
    },
    action: async ({ input }) => {
      const svc = new ArgoCDService(config, logger);
      const { applicationUrl } = await svc.createArgoResources({
        instanceName: input.argoInstance,
        appName: input.appName,
        projectName: input.projectName ?? input.appName,
        namespace: input.namespace,
        repoUrl: input.repoUrl,
        path: input.path,
        label: input.label ?? input.appName,
      });
      return { output: { applicationUrl } };
    },
  });
}
