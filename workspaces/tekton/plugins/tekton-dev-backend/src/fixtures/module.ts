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

import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  kubernetesClusterSupplierExtensionPoint,
  kubernetesObjectsProviderExtensionPoint,
  kubernetesRouterExtensionPoint,
} from '@backstage/plugin-kubernetes-node';
import express from 'express';
import Router from 'express-promise-router';

import { fixtureKubernetesClusterSupplier } from './clusterSupplier';
import { fixtureKubernetesObjectsProvider } from './objectsProvider';
import { createFixtureProxyRouter } from './proxyRouter';

/**
 * Wires fixture cluster / objects / proxy into kubernetes-backend for local and
 * Playwright e2e (no live cluster required).
 */
export const tektonFixtureKubernetesModule = createBackendModule({
  pluginId: 'kubernetes',
  moduleId: 'tektonFixtures',
  register(env) {
    env.registerInit({
      deps: {
        objects: kubernetesObjectsProviderExtensionPoint,
        clusters: kubernetesClusterSupplierExtensionPoint,
        router: kubernetesRouterExtensionPoint,
      },
      async init({ objects, clusters, router }) {
        objects.addObjectsProvider(fixtureKubernetesObjectsProvider);
        clusters.addClusterSupplier(fixtureKubernetesClusterSupplier);

        // Replace the default router so /proxy never hits a real cluster URL.
        // Resource and /clusters handlers still come from kubernetes-backend via
        // getDefault(), but we mount fixture proxy first and strip default proxy
        // by not forwarding unmatched proxy calls.
        router.addRouter(({ getDefault }) => {
          const defaultRouter = getDefault();
          const fixtureRouter = Router();

          fixtureRouter.use('/proxy', createFixtureProxyRouter());
          fixtureRouter.use(express.json());
          // Mount default routes (clusters, resources, permissions). Its own
          // /proxy is shadowed by the fixture handler above.
          fixtureRouter.use(defaultRouter);
          return fixtureRouter;
        });
      },
    });
  },
});
