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
import { getJenkinsInstances } from './getJenkinsInstances';
import { JenkinsApiImpl } from './jenkinsApi';
import {
  PermissionEvaluator,
  toPermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { stringifyError } from '@backstage/errors';
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
    const httpAuth = this.env.httpAuth;
    const permissions = this.env.permissions;
    const jenkinsInfoProvider = this.env.jenkinsInfoProvider;

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

    const router = this.buildRouter(jenkinsInfoProvider, permissions, httpAuth);

    return {
      router,
    } as unknown as JenkinsBuilderReturn;
  }

  protected buildRouter(
    jenkinsInfoProvider: JenkinsInfoProvider,
    permissionApi: PermissionEvaluator,
    httpAuth: HttpAuthService,
  ): express.Router {
    const logger = this.env.logger;

    let permissionEvaluator: PermissionEvaluator | undefined;
    if (permissionApi && 'authorizeConditional' in permissionApi) {
      permissionEvaluator = permissionApi as PermissionEvaluator;
    } else {
      logger.warn(
        'PermissionAuthorizer is deprecated. Please use an instance of PermissionEvaluator instead of PermissionAuthorizer in PluginEnvironment#permissions',
      );
      permissionEvaluator = permissionApi
        ? toPermissionEvaluator(permissionApi)
        : undefined;
    }

    const jenkinsApi = this.createJenkinsApi(permissionEvaluator);

    const router = Router();
    router.use(express.json());

    router.get(
      '/v1/entity/:namespace/:kind/:name/projects',
      async (request, response) => {
        const { namespace, kind, name } = request.params;
        const branch = request.query.branch;
        const instanceName = this.getInstanceNameQuery(request, response);
        if (instanceName === null) {
          return;
        }
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

        const jenkinsInstances = await getJenkinsInstances(
          jenkinsInfoProvider,
          {
            entityRef: {
              kind,
              namespace,
              name,
            },
            credentials: await httpAuth.credentials(request),
            instanceName,
          },
        );

        const projectsByInstance = await Promise.all(
          jenkinsInstances.map(async jenkinsInfo => {
            try {
              const projects = await jenkinsApi.getProjects(
                jenkinsInfo,
                branches,
              );

              return projects.map(project => ({
                ...project,
                instanceName: jenkinsInfo.instanceName,
              }));
            } catch (error) {
              const errorDetails =
                error instanceof AggregateError ? error.errors : error;

              // Promise.any can return an AggregateError with the unhelpful
              // message "All promises were rejected", so include its causes.
              throw new Error(
                `Unable to fetch projects from Jenkins instance '${
                  jenkinsInfo.instanceName
                }', for ${jenkinsInfo.fullJobNames}: ${stringifyError(
                  errorDetails,
                )}`,
              );
            }
          }),
        );

        response.json({
          projects: projectsByInstance.flat(),
        });
      },
    );

    router.get(
      '/v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber',
      async (request, response) => {
        const { namespace, kind, name, jobFullName, buildNumber } =
          request.params;
        const instanceName = this.getInstanceNameQuery(request, response);
        if (instanceName === null) {
          return;
        }
        const jobs = this.jobFullNameParamToJobs(jobFullName);

        const jenkinsInfo = await jenkinsInfoProvider.getInstance({
          entityRef: {
            kind,
            namespace,
            name,
          },
          fullJobNames: [jobFullName],
          instanceName,
          credentials: await httpAuth.credentials(request),
        });

        const build = await jenkinsApi.getBuild(
          jenkinsInfo,
          jobs,
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
        const instanceName = this.getInstanceNameQuery(request, response);
        if (instanceName === null) {
          return;
        }
        const jobs = this.jobFullNameParamToJobs(jobFullName);

        const jenkinsInfo = await jenkinsInfoProvider.getInstance({
          entityRef: {
            kind,
            namespace,
            name,
          },
          fullJobNames: [jobFullName],
          instanceName,
          credentials: await httpAuth.credentials(request),
        });

        const build = await jenkinsApi.getJobBuilds(jenkinsInfo, jobs);

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
        const instanceName = this.getInstanceNameQuery(request, response);
        if (instanceName === null) {
          return;
        }
        const jobs = this.jobFullNameParamToJobs(jobFullName);

        const jenkinsInfo = await jenkinsInfoProvider.getInstance({
          entityRef: {
            kind,
            namespace,
            name,
          },
          fullJobNames: [jobFullName],
          instanceName,
          credentials: await httpAuth.credentials(request),
        });

        const resourceRef = stringifyEntityRef({ kind, namespace, name });
        const status = await jenkinsApi.rebuildProject(
          jenkinsInfo,
          jobs,
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
        const instanceName = this.getInstanceNameQuery(request, response);
        if (instanceName === null) {
          return;
        }
        const jobs = this.jobFullNameParamToJobs(jobFullName);

        const jenkinsInfo = await jenkinsInfoProvider.getInstance({
          entityRef: {
            kind,
            namespace,
            name,
          },
          fullJobNames: [jobFullName],
          instanceName,
          credentials: await httpAuth.credentials(request),
        });

        const consoleText = await jenkinsApi.getBuildConsoleText(
          jenkinsInfo,
          jobs,
          parseInt(buildNumber, 10),
        );

        response.json({
          consoleText: consoleText,
        });
      },
    );

    return router;
  }

  private jobFullNameParamToJobs(jobFullName: string): string[] {
    // jobFullName may contain a list of job names separated by '/'
    return jobFullName.split('/').map((s: string) => encodeURIComponent(s));
  }

  protected createJenkinsApi(
    permissionEvaluator?: PermissionEvaluator,
  ): JenkinsApiImpl {
    return new JenkinsApiImpl(permissionEvaluator);
  }

  private getInstanceNameQuery(
    request: express.Request,
    response: express.Response,
  ): string | undefined | null {
    const instanceName = request.query.instanceName;
    if (instanceName === undefined) {
      return instanceName;
    }
    if (typeof instanceName === 'string' && instanceName.length > 0) {
      return instanceName;
    }

    response
      .status(400)
      .send('Something was unexpected about the instanceName queryString');
    return null;
  }
}
