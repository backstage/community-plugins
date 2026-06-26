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
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';

/**
 * Argo Workflows backend plugin.
 *
 * Registers the Argo Workflows API router with the Backstage backend,
 * providing proxy endpoints to communicate with Argo Workflows server instances.
 *
 * **Note:** Instances configured with `kubernetes.clusterName` require the
 * Kubernetes plugin integration dependencies (`clusterSupplier`, `fetcher`,
 * `authStrategy`). These are not automatically wired in the new backend system.
 * For Kubernetes-backed instances, use the legacy `createRouter` export and
 * provide the dependencies manually. Argo server API instances (`baseUrl` +
 * `token`) work without additional configuration.
 *
 * @public
 */
export const argoWorkflowsBackendPlugin = createBackendPlugin({
  pluginId: 'argo-workflows',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ config, httpAuth, httpRouter, logger }) {
        httpRouter.use(await createRouter({ config, httpAuth, logger }));
      },
    });
  },
});
