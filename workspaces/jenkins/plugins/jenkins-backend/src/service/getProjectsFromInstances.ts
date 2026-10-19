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

import { LoggerService } from '@backstage/backend-plugin-api';
import { ForwardedError, stringifyError } from '@backstage/errors';
import type { BackstageProject } from '../types';
import type { JenkinsInstanceInfo } from './getJenkinsInstances';
import type { JenkinsApiImpl } from './jenkinsApi';

/** A Jenkins instance whose projects could not be fetched. */
export interface JenkinsInstanceError {
  instanceName: string;
  message: string;
}

export type InstanceProject = BackstageProject & { instanceName: string };

/**
 * Fetches the projects of every given Jenkins instance.
 *
 * An unavailable instance must not hide the jobs of the healthy ones, so each
 * instance is queried independently and its failure is reported in `errors`
 * next to the projects that could be fetched. An error is only thrown when
 * every instance fails, which keeps the single-instance behaviour unchanged.
 */
export async function getProjectsFromInstances(options: {
  jenkinsApi: JenkinsApiImpl;
  jenkinsInstances: JenkinsInstanceInfo[];
  branches?: string[];
  logger?: LoggerService;
}): Promise<{ projects: InstanceProject[]; errors: JenkinsInstanceError[] }> {
  const { jenkinsApi, jenkinsInstances, branches, logger } = options;

  const results = await Promise.allSettled(
    jenkinsInstances.map(jenkinsInfo =>
      jenkinsApi.getProjects(jenkinsInfo, branches),
    ),
  );

  const projects: InstanceProject[] = [];
  const failures: Array<{ instanceName: string; error: Error }> = [];
  results.forEach((result, index) => {
    const jenkinsInfo = jenkinsInstances[index];
    const { instanceName } = jenkinsInfo;
    if (result.status === 'fulfilled') {
      projects.push(
        ...result.value.map(project => ({ ...project, instanceName })),
      );
    } else {
      failures.push({
        instanceName,
        error: toProjectsError(jenkinsInfo, result.reason),
      });
    }
  });

  if (failures.length > 0 && failures.length === jenkinsInstances.length) {
    if (failures.length === 1) {
      throw failures[0].error;
    }
    throw new Error(failures.map(({ error }) => error.message).join('\n'));
  }

  return {
    projects,
    errors: failures.map(({ instanceName, error }) => {
      logger?.warn(error.message);
      return { instanceName, message: error.message };
    }),
  };
}

function toProjectsError(
  jenkinsInfo: JenkinsInstanceInfo,
  error: unknown,
): Error {
  const message = `Unable to fetch projects from Jenkins instance '${jenkinsInfo.instanceName}', for ${jenkinsInfo.fullJobNames}`;

  // Promise.any, used when filtering by branch, rejects with an AggregateError
  // whose message "All promises were rejected" says nothing, so include its causes.
  if (error instanceof AggregateError) {
    return new Error(`${message}: ${stringifyError(error.errors)}`);
  }

  // ForwardedError takes the name of its cause, and the name is what maps
  // typed errors such as NotFoundError to their HTTP status.
  return new ForwardedError(message, error);
}
