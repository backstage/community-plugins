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
import { InputError } from '@backstage/errors';
import { validateIncidentQueryParams } from './validator';
import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { DefaultServiceNowClient } from '../service-now-rest/client';
import { ServiceNowConfig } from '../../config';

export interface RouterOptions {
  logger: LoggerService;
  servicenowConfig: ServiceNowConfig;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, servicenowConfig, httpAuth } = options;

  logger.info(
    `Creating router for ServiceNow with instance URL: ${servicenowConfig.servicenow?.instanceUrl}`,
  );

  const client = new DefaultServiceNowClient(
    servicenowConfig,
    logger.child({ service: 'servicenow-client' }),
  );
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/incidents', async (req, res) => {
    await httpAuth.credentials(req, {
      allow: ['user'],
    });

    const validatedParams = validateIncidentQueryParams(req.query);
    try {
      const incidents = await client.fetchIncidents(validatedParams);
      res.json(incidents);
    } catch (error) {
      if (error instanceof InputError) {
        throw error;
      }

      // Log the full error and throw a generic one
      logger.error('Failed to fetch incidents from ServiceNow', error);
      throw new Error('Failed to fetch incidents from ServiceNow');
    }
  });

  return router;
}
