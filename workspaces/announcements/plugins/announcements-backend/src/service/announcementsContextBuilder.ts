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

type AnnouncementsContextOptions = {
  logger: LoggerService;
  config: RootConfigService;
  database: DatabaseService;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
};

export type AnnouncementsContext = {
  logger: LoggerService;
  config: RootConfigService;
  persistenceContext: PersistenceContext;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
};

export const buildAnnouncementsContext = async ({
  logger,
  config,
  database,
  permissions,
  httpAuth,
}: AnnouncementsContextOptions): Promise<AnnouncementsContext> => {
  return {
    logger,
    config,
    persistenceContext: await initializePersistenceContext(database),
    permissions,
    httpAuth,
  };
};
