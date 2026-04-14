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

import {
  BackstageCredentials,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { stringifyError } from '@backstage/errors';
import {
  PermissionEvaluator,
  toPermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { JenkinsInfoProvider } from './jenkinsInfoProvider';
import { JenkinsApiImpl } from './jenkinsApi';
import type { BackstageBuild, BackstageProject } from '../types';

/** @public */
export interface EntityRef {
  kind?: string;
  namespace?: string;
  name: string;
}

/** @public */
export interface RebuildResult {
  status: 'success' | 'denied';
  message: string;
}

/** @public */
export interface JenkinsServiceEnvironment {
  permissions: PermissionEvaluator;
  logger: LoggerService;
  jenkinsInfoProvider: JenkinsInfoProvider;
}

/**
 * Splits a jobFullName on `/` and URL-encodes each segment.
 */
function jobFullNameToJobs(jobFullName: string): string[] {
  return jobFullName.split('/').map(s => encodeURIComponent(s));
}

function toCompoundEntityRef(entityRef: EntityRef) {
  return {
    kind: entityRef.kind ?? 'Component',
    namespace: entityRef.namespace ?? 'default',
    name: entityRef.name,
  };
}

/** @public */
export class JenkinsService {
  private readonly jenkinsApi: JenkinsApiImpl;
  private readonly jenkinsInfoProvider: JenkinsInfoProvider;

  static createService(env: JenkinsServiceEnvironment) {
    return new JenkinsService(env);
  }

  constructor(protected readonly env: JenkinsServiceEnvironment) {
    const { logger, permissions: permissionApi, jenkinsInfoProvider } = env;
    this.jenkinsInfoProvider = jenkinsInfoProvider;

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

    this.jenkinsApi = new JenkinsApiImpl(permissionEvaluator);
  }

  async getProjects(options: {
    entityRef: EntityRef;
    branches?: string[];
    credentials: BackstageCredentials;
  }): Promise<{ projects: BackstageProject[] }> {
    const { entityRef, branches, credentials } = options;

    const jenkinsInfo = await this.jenkinsInfoProvider.getInstance({
      entityRef: toCompoundEntityRef(entityRef),
      credentials,
    });

    try {
      const projects = await this.jenkinsApi.getProjects(jenkinsInfo, branches);
      return { projects };
    } catch (err: any) {
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
  }

  async getBuild(options: {
    entityRef: EntityRef;
    jobFullName: string;
    buildNumber: number;
    credentials: BackstageCredentials;
  }): Promise<{ build: BackstageBuild }> {
    const { entityRef, jobFullName, buildNumber, credentials } = options;
    const jobs = jobFullNameToJobs(jobFullName);

    const jenkinsInfo = await this.jenkinsInfoProvider.getInstance({
      entityRef: toCompoundEntityRef(entityRef),
      fullJobNames: [jobFullName],
      credentials,
    });

    const build = await this.jenkinsApi.getBuild(
      jenkinsInfo,
      jobs,
      buildNumber,
    );
    return { build };
  }

  async getJobBuilds(options: {
    entityRef: EntityRef;
    jobFullName: string;
    credentials: BackstageCredentials;
  }): Promise<{ builds: any }> {
    const { entityRef, jobFullName, credentials } = options;
    const jobs = jobFullNameToJobs(jobFullName);

    const jenkinsInfo = await this.jenkinsInfoProvider.getInstance({
      entityRef: toCompoundEntityRef(entityRef),
      fullJobNames: [jobFullName],
      credentials,
    });

    const builds = await this.jenkinsApi.getJobBuilds(jenkinsInfo, jobs);
    return { builds };
  }

  async rebuildProject(options: {
    entityRef: EntityRef;
    jobFullName: string;
    buildNumber: number;
    credentials: BackstageCredentials;
  }): Promise<RebuildResult> {
    const { entityRef, jobFullName, buildNumber, credentials } = options;

    const jobs = jobFullNameToJobs(jobFullName);

    const jenkinsInfo = await this.jenkinsInfoProvider.getInstance({
      entityRef: toCompoundEntityRef(entityRef),
      fullJobNames: [jobFullName],
      credentials,
    });

    const resourceRef = stringifyEntityRef(toCompoundEntityRef(entityRef));

    await this.jenkinsApi.rebuildProject(
      jenkinsInfo,
      jobs,
      buildNumber,
      resourceRef,
      {
        credentials,
      },
    );

    return {
      status: 'success',
      message: `Successfully triggered rebuild of ${jobFullName} #${buildNumber}`,
    };
  }

  async getBuildConsoleText(options: {
    entityRef: EntityRef;
    jobFullName: string;
    buildNumber: number;
    credentials: BackstageCredentials;
  }): Promise<{ consoleText: string }> {
    const { entityRef, jobFullName, buildNumber, credentials } = options;
    const jobs = jobFullNameToJobs(jobFullName);

    const jenkinsInfo = await this.jenkinsInfoProvider.getInstance({
      entityRef: toCompoundEntityRef(entityRef),
      fullJobNames: [jobFullName],
      credentials,
    });

    const consoleText = await this.jenkinsApi.getBuildConsoleText(
      jenkinsInfo,
      jobs,
      buildNumber,
    );
    return { consoleText };
  }
}
