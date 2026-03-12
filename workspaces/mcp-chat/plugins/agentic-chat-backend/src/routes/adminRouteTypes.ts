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
import type express from 'express';
import type { LoggerService } from '@backstage/backend-plugin-api';
import type { AgenticProvider } from '../providers';
import type { ProviderManager } from '../providers';
import type { AdminConfigService } from '../services/AdminConfigService';
import type { ChatSessionService } from '../services/ChatSessionService';

/**
 * Shared dependencies for admin sub-route modules.
 * Passed to each registerAdminXxxRoutes function.
 */
export interface AdminRouteDeps {
  router: express.Router;
  logger: LoggerService;
  config: import('@backstage/config').Config;
  provider: AgenticProvider;
  adminConfig: AdminConfigService;
  /** Provider manager for hot-swap operations */
  providerManager?: ProviderManager;
  sendRouteError: (
    res: express.Response,
    error: unknown,
    logLabel: string,
    userFacingError: string,
    extra?: Record<string, unknown>,
    statusCode?: number,
  ) => void;
  getUserRef: (req: express.Request) => Promise<string>;
  requireAdminAccess: express.RequestHandler;
  onConfigChanged?: () => void;
  /** For admin session routes */
  sessions?: ChatSessionService;
  missingSessions: (res: express.Response) => boolean;
  missingConversations: (res: express.Response) => boolean;
}
