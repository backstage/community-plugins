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
import { mdxCardPermissions } from '@backstage-community/plugin-mdx-card-common';
import { createRouter } from './service/router';
import { TemplateStore } from './service/TemplateStore';

/**
 * Backend plugin that stores MDX card templates.
 *
 * @public
 */
export const mdxCardPlugin = createBackendPlugin({
  pluginId: 'mdx-card',
  register(env) {
    env.registerInit({
      deps: {
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
      },
      async init({
        database,
        httpAuth,
        httpRouter,
        permissions,
        permissionsRegistry,
      }) {
        permissionsRegistry.addPermissions(mdxCardPermissions);
        const store = await TemplateStore.create(database);
        httpRouter.use(await createRouter({ httpAuth, permissions, store }));
      },
    });
  },
});
