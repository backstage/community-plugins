/*
 * Copyright 2020 The Backstage Authors
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

import express from 'express';
import Router from 'express-promise-router';
import { SonarqubeInfoProvider } from './sonarqubeInfoProvider';
import { InputError } from '@backstage/errors';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface RouterOptions {
  /**
   * Logger for logging purposes
   */
  logger: LoggerService;
  /**
   * Info provider to be able to get all necessary information for the APIs
   */
  sonarqubeInfoProvider: SonarqubeInfoProvider;
}

/**
 * Constructs a sonarqube router.
 *
 * Expose endpoint to get information on or for a sonarqube instance.
 *
 * @param options - Dependencies of the router
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, sonarqubeInfoProvider } = options;

  const router = Router();
  router.use(express.json());

  router.get(
    '/entities/:kind/:namespace/:name/summary',
    async (request, response) => {
      const { kind, namespace, name } = request.params;
      const componentKey = request.query.componentKey as string;
      const instanceKey = request.query.instanceKey as string;

      if (!componentKey)
        throw new InputError(
          'ComponentKey must be provided as a single string.',
        );

      logger.info(
        instanceKey
          ? `Retrieving summary for entity ${kind}:${namespace}/${name} (component ${componentKey}) in sonarqube instance ${instanceKey}`
          : `Retrieving summary for entity ${kind}:${namespace}/${name} (component ${componentKey}) in default sonarqube instance`,
      );

      const [findings, { baseUrl, externalBaseUrl }] = await Promise.all([
        sonarqubeInfoProvider.getFindings({
          componentKey,
          instanceName: instanceKey,
        }),
        sonarqubeInfoProvider.getBaseUrl({ instanceName: instanceKey }),
      ]);

      response.json({
        findings: findings ?? null,
        instanceUrl: externalBaseUrl || baseUrl,
      });
    },
  );

  router.get('/findings', async (request, response) => {
    logger.warn(
      'The /findings endpoint is deprecated and will be removed in a future release. Use /entities/:kind/:namespace/:name/summary instead.',
    );
    response.setHeader('Deprecation', 'true');
    const componentKey = request.query.componentKey as string;
    const instanceKey = request.query.instanceKey as string;

    if (!componentKey)
      throw new InputError('ComponentKey must be provided as a single string.');

    logger.info(
      instanceKey
        ? `Retrieving findings for component ${componentKey} in sonarqube instance name ${instanceKey}`
        : `Retrieving findings for component ${componentKey} in default sonarqube instance`,
    );

    response.json(
      await sonarqubeInfoProvider.getFindings({
        componentKey,
        instanceName: instanceKey,
      }),
    );
  });

  router.get('/instanceUrl', (request, response) => {
    logger.warn(
      'The /instanceUrl endpoint is deprecated and will be removed in a future release. Use /entities/:kind/:namespace/:name/summary instead.',
    );
    response.setHeader('Deprecation', 'true');
    const instanceKey = request.query.instanceKey as string;

    logger.info(
      instanceKey
        ? `Retrieving sonarqube instance URL for key ${instanceKey}`
        : `Retrieving default sonarqube instance URL as instanceKey is not provided`,
    );
    const { baseUrl, externalBaseUrl } = sonarqubeInfoProvider.getBaseUrl({
      instanceName: instanceKey,
    });
    response.json({
      instanceUrl: externalBaseUrl || baseUrl,
    });
  });

  return router;
}
