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
import { InputError, NotFoundError } from '@backstage/errors';
import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';

/**
 * @internal
 *
 * Dependencies needed by the router
 */
export interface RouterOptions {
  /**
   * Logger for logging purposes
   */
  logger: LoggerService;
  /**
   * Info provider to be able to get all necessary information for the APIs
   */
  sonarqubeInfoProvider: SonarqubeInfoProvider;

  /**
   * Catalog service to retrieve entities from the catalog, which is necessary to retrieve the sonarqube instance information for an entity
   */
  catalog: CatalogService;

  /**
   * HTTP auth service to retrieve credentials from the incoming request
   */
  httpAuth: HttpAuthService;
}

/**
 * @internal
 *
 * Constructs a sonarqube router.
 *
 * Expose endpoint to get information on or for a sonarqube instance.
 *
 * @param options - Dependencies of the router
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, sonarqubeInfoProvider, catalog, httpAuth } = options;

  const router = Router();
  router.use(express.json());

  router.get(
    '/entities/:kind/:namespace/:name/summary',
    async (request, response) => {
      const { kind, namespace, name } = request.params;

      const credentials = await httpAuth.credentials(request);
      const entity = await catalog.getEntityByRef(
        { kind, namespace, name },
        { credentials },
      );

      if (!entity) {
        throw new NotFoundError(
          `Entity ${kind}:${namespace}/${name} not found`,
        );
      }

      const annotation =
        entity.metadata.annotations?.['sonarqube.org/project-key'];
      if (!annotation) {
        throw new InputError(
          `Entity ${kind}:${namespace}/${name} is missing the sonarqube.org/project-key annotation`,
        );
      }

      // The annotation format is either "projectKey" or "instanceName/projectKey".
      // The first "/" is the instance separator. Bare project keys must not contain "/".
      const separatorIndex = annotation.indexOf('/');
      const instanceName =
        separatorIndex > -1
          ? annotation.substring(0, separatorIndex)
          : undefined;
      const componentKey =
        separatorIndex > -1
          ? annotation.substring(separatorIndex + 1)
          : annotation;

      logger.info(
        instanceName
          ? `Retrieving summary for entity ${kind}:${namespace}/${name} (component ${componentKey}) in sonarqube instance ${instanceName}`
          : `Retrieving summary for entity ${kind}:${namespace}/${name} (component ${componentKey}) in default sonarqube instance`,
      );

      const [findings, { baseUrl, externalBaseUrl }] = await Promise.all([
        sonarqubeInfoProvider.getFindings({ componentKey, instanceName }),
        sonarqubeInfoProvider.getBaseUrl({ instanceName }),
      ]);

      response.json({
        findings: findings ?? null,
        instanceUrl: externalBaseUrl || baseUrl,
        componentKey,
      });
    },
  );

  /**
   * @deprecated This endpoint is deprecated and will be removed in a future release. Use /entities/:kind/:namespace/:name/summary instead, which provides the same information in addition to the sonarqube instance URL.
   */
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

  /**
   * @deprecated This endpoint is deprecated and will be removed in a future release. Use /entities/:kind/:namespace/:name/summary instead, which provides the same information in addition to the sonarqube instance URL.
   */
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
