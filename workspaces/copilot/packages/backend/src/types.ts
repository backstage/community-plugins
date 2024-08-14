import { Logger } from 'winston';
import { Config } from '@backstage/config';
import {
  DiscoveryService,
  AuthService,
  HttpAuthService,
  SchedulerService,
  CacheService,
  DatabaseService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';

export type PluginEnvironment = {
  logger: Logger;
  database: DatabaseService;
  cache: CacheService;
  config: Config;
  reader: UrlReaderService;
  discovery: DiscoveryService;
  scheduler: SchedulerService;
  permissions: PermissionEvaluator;
  auth: AuthService;
  httpAuth: HttpAuthService;
};
