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
import { JenkinsInfoProvider } from './jenkinsInfoProvider';
import { JenkinsService } from './jenkinsService';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';

import { Config } from '@backstage/config';

/** @public */
export type JenkinsBuilderReturn = Promise<{
  router: express.Router;
}>;

/** @public */
export interface JenkinsEnvironment {
  permissions: PermissionEvaluator;
  config: Config;
  logger: LoggerService;
  jenkinsInfoProvider: JenkinsInfoProvider;
  discovery: DiscoveryService;
  auth?: AuthService;
  httpAuth: HttpAuthService;
  jenkinsService: JenkinsService;
}

/** @public */
export class JenkinsBuilder {
  static createBuilder(env: JenkinsEnvironment) {
    return new JenkinsBuilder(env);
  }

  constructor(protected readonly env: JenkinsEnvironment) {}

  public async build() {
    const logger = this.env.logger;
    const config = this.env.config;

    logger.info('Initializing Jenkins backend');

    if (!config.has('jenkins')) {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Jenkins configuration is missing');
      }
      logger.warn(
        'Failed to initialize Jenkins backend: Jenkins config is missing',
      );
      return {
        router: Router(),
      } as unknown as JenkinsBuilderReturn;
    }

    const router = this.buildRouter();

    return {
      router,
    } as unknown as JenkinsBuilderReturn;
  }

  protected buildRouter(): express.Router {
    const { jenkinsService, httpAuth } = this.env;
    const router = Router();
    router.use(express.json());

    router.get(
      '/v1/entity/:namespace/:kind/:name/projects',
      async (request, response) => {
        const { namespace, kind, name } = request.params;
        const branch = request.query.branch;
        let branches: string[] | undefined;

        if (branch === undefined) {
          branches = undefined;
        } else if (typeof branch === 'string') {
          branches = branch.split(/,/g);
        } else {
          // this was passed in as something weird -> 400
          // https://evanhahn.com/gotchas-with-express-query-parsing-and-how-to-avoid-them/
          response
            .status(400)
            .send('Something was unexpected about the branch queryString');

          return;
        }

        const credentials = await httpAuth.credentials(request);
        const result = await jenkinsService.getProjects({
          entityRef: { kind, namespace, name },
          branches,
          credentials,
        });

        response.json(result);
      },
    );

    router.get(
      '/v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber',
      async (request, response) => {
        const { namespace, kind, name, jobFullName, buildNumber } =
          request.params;
        const credentials = await httpAuth.credentials(request);

        const result = await jenkinsService.getBuild({
          entityRef: { kind, namespace, name },
          jobFullName,
          buildNumber: parseInt(buildNumber, 10),
          credentials,
        });

        response.json(result);
      },
    );

    router.get(
      '/v1/entity/:namespace/:kind/:name/job/:jobFullName',
      async (request, response) => {
        const { namespace, kind, name, jobFullName } = request.params;
        const credentials = await httpAuth.credentials(request);

        const result = await jenkinsService.getJobBuilds({
          entityRef: { kind, namespace, name },
          jobFullName,
          credentials,
        });

        response.json({
          build: result.builds,
        });
      },
    );

    router.post(
      '/v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber',
      async (request, response) => {
        const { namespace, kind, name, jobFullName, buildNumber } =
          request.params;
        const credentials = await httpAuth.credentials(request);

        const result = await jenkinsService.rebuildProject({
          entityRef: { kind, namespace, name },
          jobFullName,
          buildNumber: parseInt(buildNumber, 10),
          credentials,
        });

        const statusCode = result.status === 'success' ? 200 : 401;
        response.status(statusCode).json({});
      },
    );

    router.get(
      '/v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber/consoleText',
      async (request, response) => {
        const { namespace, kind, name, jobFullName, buildNumber } =
          request.params;
        const credentials = await httpAuth.credentials(request);

        const result = await jenkinsService.getBuildConsoleText({
          entityRef: { kind, namespace, name },
          jobFullName,
          buildNumber: parseInt(buildNumber, 10),
          credentials,
        });

        response.json(result);
      },
    );

    return router;
  }
}
