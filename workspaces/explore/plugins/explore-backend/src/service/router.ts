/*
 * Copyright 2022 The Backstage Authors
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

import { errorHandler } from '@backstage/backend-common';
import { GetExploreToolsRequest } from '@backstage-community/plugin-explore-common';
import express from 'express';
import Router from 'express-promise-router';
import { ExploreToolProvider } from '../tools';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * @public
 */
export interface RouterOptions {
  logger: LoggerService;
  toolProvider: ExploreToolProvider;
}

/**
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { toolProvider } = options;

  const router = Router();
  router.use(express.json());

  router.get('/tools', async (request, response) => {
    const requestQuery = parseExploreToolRequestQuery(request.query);
    const result = await toolProvider.getTools(requestQuery);
    response.json(result);
  });

  router.use(errorHandler());

  return router;
}

function parseExploreToolRequestQuery(
  params: Record<string, unknown>,
): GetExploreToolsRequest {
  // TODO: Implement proper query parsing for the filters
  //  Also consider using a `filter` query string like catalog client does
  return {
    filter: {
      tags: [...[(params?.tag as any) ?? []]].flat(),
      lifecycle: [...[(params?.lifecycle as any) ?? []]].flat(),
    },
  };
}
