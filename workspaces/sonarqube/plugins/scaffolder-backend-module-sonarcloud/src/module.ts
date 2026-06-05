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
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import {
  createSonarCloudCreateProjectAction,
  createSonarCloudBindProjectAction,
  createSonarCloudSetDefaultBranchAction,
  createSonarCloudSetQualityGateAction,
  createSonarCloudSetNewCodeDefinitionAction,
} from './actions';

/**
 * A backend module that registers SonarCloud scaffolder actions.
 *
 * Reads default token and organization from app-config:
 * ```yaml
 * sonarcloud:
 *   token: ${SONARCLOUD_TOKEN}
 *   organization: my-org
 * ```
 *
 * Actions use config values by default. Input values override config when provided.
 *
 * @public
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'sonarcloud',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolderActions, config }) {
        const sonarcloudConfig = config.getOptionalConfig('sonarcloud');
        const defaults = {
          token: sonarcloudConfig?.getOptionalString('token'),
          organization: sonarcloudConfig?.getOptionalString('organization'),
        };

        scaffolderActions.addActions(
          createSonarCloudCreateProjectAction(defaults),
          createSonarCloudBindProjectAction(defaults),
          createSonarCloudSetDefaultBranchAction(defaults),
          createSonarCloudSetQualityGateAction(defaults),
          createSonarCloudSetNewCodeDefinitionAction(defaults),
        );
      },
    });
  },
});
