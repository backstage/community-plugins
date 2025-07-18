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
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { jenkinsPermissions } from '@backstage-community/plugin-jenkins-common';

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
          // Get status and reason from the error handler
          const { status, reason } = this.handleError(err);

          const config = this.env.config;
          response.status(status).json({
            errorReason: reason,
            connectionIssueMessage: config.getOptionalString(
              'jenkins.connectionIssueMessage',
            ),
            jenkinsJobFullPath: `${jenkinsInfo.baseUrl}/${jenkinsInfo.fullJobNames}`,
          });

          // Handle aggregate errors
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
        const jobs = this.jobFullNameParamToJobs(jobFullName);

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
        const jobs = this.jobFullNameParamToJobs(jobFullName);

        const jenkinsInfo = await jenkinsInfoProvider.getInstance({
          entityRef: {
            kind,
            namespace,
            name,
          },
          fullJobNames: [jobFullName],
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
        const jobs = this.jobFullNameParamToJobs(jobFullName);

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
        const jobs = this.jobFullNameParamToJobs(jobFullName);

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

  /**
   * Handles error mapping for Jenkins API responses.
   * Maps system errors (errno) and HTTP responses to appropriate status codes and messages.
   *
   * @param err - The error object to handle, can be a system error with errno/code or an HTTP response error
   * @returns An object containing:
   *          - status: HTTP status code (e.g., 400, 401, 403, 500)
   *          - reason: Human-readable explanation of the error
   * @private
   */
  private handleError(err: any): { status: number; reason: string } {
    let status = 500;
    let reason = 'Internal Server Error';

    if (err.errno && err.code) {
      ({ status, reason } = mapErrnoToHttpStatus(err.code || err.errno));
    } else if (err.response) {
      // Handle cases where statusCode or statusMessage might be undefined
      status = err.response.statusCode || 500;
      reason =
        err.response.statusMessage ||
        (err.response.statusCode
          ? `HTTP Error ${err.response.statusCode}`
          : 'Unknown Error');
    }

    return { status, reason };
  }
}

/**
 * Maps Node.js errno values to HTTP status codes and provides an explanation.
 */
function mapErrnoToHttpStatus(errno: string | number): {
  status: number;
  reason: string;
} {
  switch (errno) {
    // 400 Bad Request family
    case 'EINVAL': // Invalid argument
    case -22:
    case 'EADDRNOTAVAIL': // Address not available
    case -99:
    case 'EADDRINUSE': // Address already in use
    case -98:
    case 'EBADF': // Bad file descriptor
    case -9:
    case 'ENOTDIR': // Not a directory
    case -20:
    case 'EISDIR': // Is a directory
    case -21:
    case 'EMSGSIZE': // Message too long
    case -90:
    case 'ENAMETOOLONG': // Name too long
    case -36:
    case 'ENOTEMPTY': // Directory not empty
    case -39:
    case 'ENOSPC': // No space left on device
    case -28:
    case 'EROFS': // Read-only file system
    case -30:
    case 'ENODEV': // No such device
    case -19:
    case 'ENXIO': // No such device or address
    case -6:
    case 'EFAULT': // Bad address
    case -14:
      return {
        status: 400,
        reason:
          'Bad Request: The request was invalid or contained invalid parameters.',
      };

    // 401 Unauthorized
    case 'EPERM': // Operation not permitted
    case -1:
    case 'EAUTH': // Custom: Authentication error
      return {
        status: 401,
        reason: 'Unauthorized: Authentication is required or has failed.',
      };

    // 403 Forbidden
    case 'EACCES': // Permission denied
    case -13:
      return {
        status: 403,
        reason:
          'Forbidden: You do not have permission to access this resource.',
      };

    // 404 Not Found
    case 'ENOENT': // No such file or directory
    case -2:
      return {
        status: 404,
        reason: 'Not Found: The requested resource could not be found.',
      };

    // 408 Request Timeout
    case 'ETIMEDOUT': // Connection timed out
    case -3002:
      return {
        status: 408,
        reason:
          'Request Timeout: The server timed out waiting for the request.',
      };

    // 409 Conflict
    case 'EEXIST': // File exists
    case -17:
      return {
        status: 409,
        reason:
          'Conflict: The request could not be completed due to a conflict.',
      };

    // 410 Gone
    case 'ENODATA': // No data available
    case -61:
      return {
        status: 410,
        reason: 'Gone: The requested resource is no longer available.',
      };

    // 429 Too Many Requests
    case 'EAGAIN': // Resource temporarily unavailable
    case -11:
      return {
        status: 429,
        reason:
          'Too Many Requests: You have sent too many requests in a given amount of time.',
      };

    // 500 Internal Server Error family
    case 'EIO': // I/O error
    case -5:
    case 'ENOSYS': // Function not implemented
    case -38:
    case 'EPIPE': // Broken pipe
    case -32:
    case 'ESPIPE': // Illegal seek
    case -29:
      return {
        status: 500,
        reason:
          'Internal Server Error: An unexpected error occurred on the server.',
      };

    // 502 Bad Gateway
    case 'ENOTFOUND': // DNS lookup failed
    case -3008:
    case 'ECONNREFUSED': // Connection refused
    case -3005:
    case 'ECONNRESET': // Connection reset by peer
    case -3004:
    case 'EHOSTUNREACH': // No route to host
    case -3006:
    case 'ENETUNREACH': // Network is unreachable
    case -3007:
      return {
        status: 502,
        reason:
          'Bad Gateway: The server received an invalid response from the upstream server.',
      };

    // 503 Service Unavailable
    case 'EAI_AGAIN': // DNS lookup timed out
    case -3001:
    case 'EUNAVAILABLE': // Custom: Service unavailable
      return {
        status: 503,
        reason:
          'Service Unavailable: The server is currently unable to handle the request.',
      };

    default:
      return {
        status: 500,
        reason: 'Internal Server Error: An unexpected error occurred.',
      };
  }
}
