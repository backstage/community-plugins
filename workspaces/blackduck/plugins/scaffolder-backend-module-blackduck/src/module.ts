/*
 * Copyright 2024 The Backstage Authors
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
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createBlackduckProjectAction } from './actions';
import { BlackDuckConfig } from '@backstage-community/plugin-blackduck-node';

/**
 * @public
 */
export const scaffolderModuleBlackduckModule = createBackendModule({
  moduleId: 'blackduck',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ scaffolderActions, config, logger }) {
        const blackDuckConfig = BlackDuckConfig.fromConfig(config);
        scaffolderActions.addActions(
          createBlackduckProjectAction(blackDuckConfig, logger),
        );
      },
    });
  },
});
