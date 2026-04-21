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
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { createArgoCDResourceAction } from './createArgoCDResourceAction';

import {
  LoggerService,
  PermissionsService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';
import { createFindApplicationsAction } from './createFindApplicationsAction';
import { createGetApplicationAction } from './createGetApplicationAction';
import { createGetRevisionDetailsAction } from './createGetRevisionDetailsAction';
import { createListApplicationsAction } from './createListApplicationsAction';

/**
 * Registers all ArgoCD actions with the ActionsRegistryService.
 *
 * @internal
 */
export function createArgoCDActions(options: {
  actionsRegistry: ActionsRegistryService;
  argoCDService: ArgoCDService;
  permissions: PermissionsService;
  logger: LoggerService;
  config: RootConfigService;
}) {
  createArgoCDResourceAction(options);
  createFindApplicationsAction(options);
  createGetApplicationAction(options);
  createGetRevisionDetailsAction(options);
  createListApplicationsAction(options);
}
