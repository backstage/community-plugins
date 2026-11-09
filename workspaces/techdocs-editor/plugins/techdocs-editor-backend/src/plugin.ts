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

import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { techdocsEditorVcsProviderExtensionPoint } from '@backstage-community/plugin-techdocs-editor-node';
import { VcsProviderRegistry } from './service/VcsProviderRegistry';
import { createRouter } from './service/router';

/**
 * The TechDocs editor backend plugin.
 * Provides REST endpoints for reading documentation source files and submitting
 * pull/merge requests with edits.
 *
 * @public
 */
export const techdocsEditorPlugin = createBackendPlugin({
  pluginId: 'techdocs-editor',
  register(env) {
    const providerRegistry = new VcsProviderRegistry();

    env.registerExtensionPoint(techdocsEditorVcsProviderExtensionPoint, {
      addProvider(provider) {
        providerRegistry.register(provider);
      },
    });

    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        reader: coreServices.urlReader,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        auth: coreServices.auth,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
      },
      async init({
        logger,
        config,
        reader,
        httpRouter,
        httpAuth,
        userInfo,
        auth,
        discovery,
        permissions,
      }) {
        const catalogClient = new CatalogClient({ discoveryApi: discovery });

        const router = await createRouter({
          logger,
          config,
          reader,
          httpAuth,
          userInfo,
          auth,
          catalog: catalogClient,
          providerRegistry,
          permissions,
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
