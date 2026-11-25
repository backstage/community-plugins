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
// Copyright 2024 Larder Software Limited
// Migrated from https://github.com/RoadieHQ/roadie-backstage-plugins in 2026.
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import * as backendModuleHttp from './actions';

/**
 * @public
 * The Scaffolder Backend HTTP Request module
 */
export const scaffolderBackendModuleHttpRequest = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'scaffolder-backend-module-http-request',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, discovery, auth, config }) {
        scaffolder.addActions(
          backendModuleHttp.createHttpBackstageAction({
            discovery,
            auth,
            config,
          }),
        );
      },
    });
  },
});
