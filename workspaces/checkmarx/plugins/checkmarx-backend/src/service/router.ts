/*
 * Copyright 2026 The Backstage Authors
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
import { InputError, NotFoundError } from '@backstage/errors';
import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import {
  CHECKMARX_DEFAULT_BRANCH_ANNOTATION,
  CHECKMARX_PROJECT_ID_ANNOTATION,
} from '@backstage-community/plugin-checkmarx-react';
import { CheckmarxInfoProvider } from './checkmarxInfoProvider';

export interface RouterOptions {
  logger: LoggerService;
  checkmarxInfoProvider: CheckmarxInfoProvider;
  catalog: CatalogService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, checkmarxInfoProvider, catalog, httpAuth } = options;

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

      const projectId =
        entity.metadata.annotations?.[CHECKMARX_PROJECT_ID_ANNOTATION];
      if (!projectId) {
        throw new InputError(
          `Entity ${kind}:${namespace}/${name} is missing the ${CHECKMARX_PROJECT_ID_ANNOTATION} annotation`,
        );
      }

      const defaultBranch =
        entity.metadata.annotations?.[CHECKMARX_DEFAULT_BRANCH_ANNOTATION];

      logger.info(
        defaultBranch
          ? `Retrieving Checkmarx summary for entity ${kind}:${namespace}/${name}, project ${projectId}, branch ${defaultBranch}`
          : `Retrieving Checkmarx summary for entity ${kind}:${namespace}/${name}, project ${projectId}, fallback branches main/master`,
      );

      response.json(
        await checkmarxInfoProvider.getSummary({
          projectId,
          defaultBranch,
        }),
      );
    },
  );

  return router;
}
