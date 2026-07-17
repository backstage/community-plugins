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
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';
import { createListBuildsAction } from './createListBuildsAction';
import { createGetBuildAction } from './createGetBuildAction';
import { createGetBuildLogsAction } from './createGetBuildLogsAction';
import { createTriggerBuildAction } from './createTriggerBuildAction';

export { createListBuildsAction } from './createListBuildsAction';
export { createGetBuildAction } from './createGetBuildAction';
export { createGetBuildLogsAction } from './createGetBuildLogsAction';
export { createTriggerBuildAction } from './createTriggerBuildAction';

/**
 * Registers all Jenkins actions with the ActionsRegistryService.
 *
 * @public
 */
export function createJenkinsActions(options: {
  actionsRegistry: ActionsRegistryService;
  jenkinsInfoProvider: JenkinsInfoProvider;
  permissions: PermissionsService;
}) {
  const { actionsRegistry, jenkinsInfoProvider, permissions } = options;
  const jenkinsApi = new JenkinsApiImpl(permissions);

  createListBuildsAction({ actionsRegistry, jenkinsInfoProvider, jenkinsApi });
  createGetBuildAction({ actionsRegistry, jenkinsInfoProvider, jenkinsApi });
  createGetBuildLogsAction({
    actionsRegistry,
    jenkinsInfoProvider,
    jenkinsApi,
  });
  createTriggerBuildAction({
    actionsRegistry,
    jenkinsInfoProvider,
    jenkinsApi,
  });
}
