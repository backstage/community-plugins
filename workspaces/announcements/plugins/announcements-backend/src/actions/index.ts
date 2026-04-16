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
export { createListAnnouncementsAction } from './createListAnnouncementsAction';
export { createGetAnnouncementAction } from './createGetAnnouncementAction';
export { createCreateAnnouncementAction } from './createCreateAnnouncementAction';
export { createDeleteAnnouncementAction } from './createDeleteAnnouncementAction';

import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { PermissionsService } from '@backstage/backend-plugin-api';
import { PersistenceContext } from '../service/persistence';
import { createListAnnouncementsAction } from './createListAnnouncementsAction';
import { createGetAnnouncementAction } from './createGetAnnouncementAction';
import { createCreateAnnouncementAction } from './createCreateAnnouncementAction';
import { createDeleteAnnouncementAction } from './createDeleteAnnouncementAction';

/**
 * Registers all ActionsRegistryService actions for the announcements plugin.
 * @internal
 */
export function createAnnouncementsActions(options: {
  actionsRegistry: ActionsRegistryService;
  persistenceContext: PersistenceContext;
  permissions: PermissionsService;
}) {
  createListAnnouncementsAction(options);
  createGetAnnouncementAction(options);
  createCreateAnnouncementAction(options);
  createDeleteAnnouncementAction(options);
}
