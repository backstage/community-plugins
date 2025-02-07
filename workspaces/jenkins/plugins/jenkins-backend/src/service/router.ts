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
import { JenkinsApiImpl } from './jenkinsApi';
import {
  PermissionAuthorizer,
  PermissionEvaluator,
  toPermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { stringifyError } from '@backstage/errors';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { jenkinsPermissions } from '@backstage-community/plugin-jenkins-common';
import {
  DiscoveryService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { Config } from '@backstage/config';

/** @internal */
export interface RouterOptions {
  logger: LoggerService;
  jenkinsInfoProvider: JenkinsInfoProvider;
  permissions?: PermissionEvaluator | PermissionAuthorizer;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  config: Config;
}

/** @internal */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { jenkinsInfoProvider, permissions, logger, httpAuth, config } =
    options;

  let permissionEvaluator: PermissionEvaluator | undefined;
  if (permissions && 'authorizeConditional' in permissions) {
    permissionEvaluator = permissions as PermissionEvaluator;
  } else {
    logger.warn(
      'PermissionAuthorizer is deprecated. Please use an instance of PermissionEvaluator instead of PermissionAuthorizer in PluginEnvironment#permissions',
    );
    permissionEvaluator = permissions
      ? toPermissionEvaluator(permissions)
      : undefined;
  }

  const jenkinsApi = new JenkinsApiImpl(permissionEvaluator);

  const router = Router();
  router.use(express.json());
  router.use(
    createPermissionIntegrationRouter({
      permissions: jenkinsPermissions,
    }),
  );

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

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef: {
          kind,
          namespace,
          name,
        },
        credentials: await httpAuth.credentials(request),
      });

      try {
        const projects = await jenkinsApi.getProjects(jenkinsInfo, branches);

        response.json({
          projects: projects,
        });
      } catch (err) {
        // Promise.any, used in the getProjects call returns an Aggregate error message with a useless error message 'AggregateError: All promises were rejected'
        // extract useful information ourselves
        if (err.errors) {
          throw new Error(
            `Unable to fetch projects, for ${
              jenkinsInfo.fullJobNames
            }: ${stringifyError(err.errors)}`,
          );
        }
        throw err;
      }
    },
  );

  router.get(
    '/v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber',
    async (request, response) => {
      const { namespace, kind, name, jobFullName, buildNumber } =
        request.params;

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef: {
          kind,
          namespace,
          name,
        },
        fullJobNames: [jobFullName],
        credentials: await httpAuth.credentials(request),
      });

      const build = await jenkinsApi.getBuild(
        jenkinsInfo,
        jobFullName,
        parseInt(buildNumber, 10),
      );

      response.json({
        build: build,
      });
    },
  );

  router.get(
    '/v1/entity/:namespace/:kind/:name/job/:jobFullName',
    async (request, response) => {
      const { namespace, kind, name, jobFullName } = request.params;

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef: {
          kind,
          namespace,
          name,
        },
        fullJobNames: [jobFullName],
        credentials: await httpAuth.credentials(request),
      });

      const build = await jenkinsApi.getJobBuilds(jenkinsInfo, jobFullName);

      response.json({
        build: build,
      });
    },
  );

  router.post(
    '/v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber',
    async (request, response) => {
      const { namespace, kind, name, jobFullName, buildNumber } =
        request.params;
      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef: {
          kind,
          namespace,
          name,
        },
        fullJobNames: [jobFullName],
        credentials: await httpAuth.credentials(request),
      });

      const resourceRef = stringifyEntityRef({ kind, namespace, name });
      const status = await jenkinsApi.rebuildProject(
        jenkinsInfo,
        jobFullName,
        parseInt(buildNumber, 10),
        resourceRef,
        {
          credentials: await httpAuth.credentials(request),
        },
      );
      response.json({}).status(status);
    },
  );

  router.get(
    '/v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber/consoleText',
    async (request, response) => {
      const { namespace, kind, name, jobFullName, buildNumber } =
        request.params;

      const jenkinsInfo = await jenkinsInfoProvider.getInstance({
        entityRef: {
          kind,
          namespace,
          name,
        },
        fullJobNames: [jobFullName],
        credentials: await httpAuth.credentials(request),
      });

      const consoleText = await jenkinsApi.getBuildConsoleText(
        jenkinsInfo,
        jobFullName,
        parseInt(buildNumber, 10),
      );

      response.json({
        consoleText: consoleText,
      });
    },
  );

  router.use(MiddlewareFactory.create({ config, logger }).error());
  return router;
}
