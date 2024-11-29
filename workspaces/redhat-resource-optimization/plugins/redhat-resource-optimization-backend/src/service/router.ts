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

  return router;
}
