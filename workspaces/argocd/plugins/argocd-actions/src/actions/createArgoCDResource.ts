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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';
/**
 * @public
 */
export function createArgoCDResource(
  config: RootConfigService,
  logger: LoggerService,
) {
  return createTemplateAction({
    id: 'argocd:create-resources',
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

    async handler(ctx) {
      const {
        appName,
        argoInstance,
        namespace,
        repoUrl,
        path,
        label,
        projectName,
      } = ctx.input;
      const svc = new ArgoCDService(config, logger);
      const { applicationUrl } = await svc.createArgoResources({
        instanceName: argoInstance,
        appName,
        projectName: projectName ?? appName,
        namespace,
        repoUrl,
        path,
        label: label ?? appName,
      });
      ctx.output('applicationUrl', applicationUrl);
    },
  });
}
