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
  initializePersistenceContext,
  PersistenceContext,
} from './persistence/persistenceContext';
import {
  DatabaseService,
  HttpAuthService,
  LoggerService,
  PermissionsRegistryService,
  PermissionsService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { EventsService } from '@backstage/plugin-events-node';
import { SignalsService } from '@backstage/plugin-signals-node';

/**
 * Context for the announcements plugin.
 *
 * @public
 */
export type AnnouncementsContext = {
  config: RootConfigService;
  events?: EventsService;
  httpAuth: HttpAuthService;
  logger: LoggerService;
  permissions: PermissionsService;
  permissionsRegistry: PermissionsRegistryService;
  persistenceContext: PersistenceContext;
  signals?: SignalsService;
};

/**
 * Options to build the context for the announcements plugin.
 *
 * @public
 */
export type AnnouncementsContextOptions = Omit<
  AnnouncementsContext,
  'persistenceContext'
> & {
  database: DatabaseService;
};

/**
 * Builds the context for the announcements plugin.
 *
 * @public
 */
export const buildAnnouncementsContext = async ({
  config,
  database,
  events,
  httpAuth,
  logger,
  permissions,
  permissionsRegistry,
  signals,
}: AnnouncementsContextOptions): Promise<AnnouncementsContext> => {
  return {
    config,
    events,
    httpAuth,
    logger,
    permissions,
    permissionsRegistry,
    persistenceContext: await initializePersistenceContext(database),
    signals,
  };
};
