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
import { EventsService } from '@backstage/plugin-events-node/index';
import {
  initializePersistenceContext,
  PersistenceContext,
} from './persistence/persistenceContext';
import {
  DatabaseService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { SignalsService } from '@backstage/plugin-signals-node/index';

/**
 * Context for the announcements plugin.
 *
 * @public
 */
export type AnnouncementsContext = {
  logger: LoggerService;
  config: RootConfigService;
  persistenceContext: PersistenceContext;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
  events?: EventsService;
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
  logger,
  config,
  database,
  permissions,
  httpAuth,
  events,
  signals,
}: AnnouncementsContextOptions): Promise<AnnouncementsContext> => {
  return {
    logger,
    config,
    persistenceContext: await initializePersistenceContext(database),
    permissions,
    httpAuth,
    events,
    signals,
  };
};
