import { Logger } from 'winston';
import { PluginDatabaseManager } from '@backstage/backend-common';
import {
  initializePersistenceContext,
  PersistenceContext,
} from './persistence/persistenceContext';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';

export type AnnouncementsContextOptions = {
  logger: Logger;
  database: PluginDatabaseManager;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
};

export type AnnouncementsContext = {
  logger: Logger;
  persistenceContext: PersistenceContext;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
};

export const buildAnnouncementsContext = async ({
  logger,
  database,
  permissions,
  httpAuth,
}: AnnouncementsContextOptions): Promise<AnnouncementsContext> => {
  return {
    logger: logger,
    persistenceContext: await initializePersistenceContext(database),
    permissions: permissions,
    httpAuth: httpAuth,
  };
};
