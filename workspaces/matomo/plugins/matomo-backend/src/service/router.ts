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
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import type { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import express, { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Options for configuring the router.
 *
 * @public
 */
export interface RouterOptions {
  /**
   * The logger service to be used by the router.
   */
  logger: LoggerService;
  /**
   * The backstage config for the router.
   */
  config: Config;
}

/**
 * Exposed createRouter for to support old backend.
 * @packageDocumentation
 * @public */
export async function createRouter(options: RouterOptions): Promise<Router> {
  const { logger, config } = options;

  const matomoToken = config.getString('matomo.apiToken');
  const matomoApiUrl = config.getString('matomo.apiUrl');
  const isSecure = config.getOptionalBoolean('matomo.secure');
  if (!matomoToken || !matomoApiUrl) {
    throw new Error(
      'Missing matomo config in app-config.yaml. Add matomo.apiToken and matomo.apiUrl in config',
    );
  }

  const router = Router();
  router.use(express.urlencoded({ extended: false }));
  router.use((req, res, next) => {
    if (req.method === 'POST' && req.body) {
      const params = new URLSearchParams(req.body);
      const method = params.get('method');
      if (!method?.includes('.get')) {
        res.status(400).json({ message: 'read only operation' });
        return;
      }
      params.set('token_auth', matomoToken);
      req.body = params.toString();
    }
    next();
  });

  router.use(
    '/',
    createProxyMiddleware({
      target: matomoApiUrl,
      changeOrigin: true,
      secure: isSecure ?? true,
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(req.body));
        proxyReq.write(req.body);
      },
      pathRewrite: {
        ['/api/matomo']: '/',
      },
    }),
  );

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
