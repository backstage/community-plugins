import { errorHandler } from '@backstage/backend-common';
import type {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { registerHealthRoutes } from '../routes/health';
import { registerTokenRoutes } from '../routes/token';

/** @public */
export interface RouterOptions {
  logger: LoggerService;
  config?: RootConfigService;
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  registerHealthRoutes(router, options);
  registerTokenRoutes(router, options);

  router.use(errorHandler());
  return router;
}
