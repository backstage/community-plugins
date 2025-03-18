/*
 * Copyright 2024 The Backstage Authors
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
import { JenkinsApi } from '@backstage-community/plugin-jenkins';
import { Entity, getCompoundEntityRef } from '@backstage/catalog-model';
import { createApiRef } from '@backstage/core-plugin-api';
import { MssvApi, MssvApiResponse } from './mssv';
import { PipelineRunResult } from '../models/pipelineRunResult';
import { JenkinsRunStatus, RunStatus } from '../types/pipelinerun';

// Apiref to map with client
export const mssvJenkinsApiRef = createApiRef<MssvApi>({
  id: 'plugin.mssv-api-jenkins.service',
});

const mapStatus = (status: string): RunStatus => {
  const runStatus = JenkinsRunStatus[status as keyof typeof JenkinsRunStatus];
  switch (runStatus) {
    case JenkinsRunStatus.SUCCESS:
      return RunStatus.Succeeded;
    case JenkinsRunStatus.FAILURE:
      return RunStatus.Failed;
    case JenkinsRunStatus.RUNNING:
      return RunStatus.Running;
    case JenkinsRunStatus['IN PROGRESS']:
      return RunStatus['In Progress'];
    case JenkinsRunStatus.NOT_BUILT:
      return RunStatus.FailedToStart;
    case JenkinsRunStatus.ABORTED:
      return RunStatus.Cancelled;
    case JenkinsRunStatus.PENDING:
      return RunStatus.Pending;
    default:
      return RunStatus.Unknown;
  }
};

export class MssvJenkinsClient implements MssvApi {
  private readonly jenkinsApi: JenkinsApi;

  constructor(options: { jenkinsApi: JenkinsApi }) {
    this.jenkinsApi = options.jenkinsApi;
  }

  async getPipelineSummary(options: {
    entity: Entity;
    page: number;
    pageSize: number;
  }): Promise<MssvApiResponse> {
    const { entity, page, pageSize } = options;

    const projects = await this.jenkinsApi.getProjects({
      entity: getCompoundEntityRef(entity),
      filter: {}, // TODO: TO CHECK
    });

    const [sliceStart, sliceEnd] = [
      page * pageSize,
      page * pageSize + pageSize,
    ];

    const projectsSlice = projects.slice(sliceStart, sliceEnd);

    // Fetch logs for each projects last build
    const projectWithLogs = await Promise.all(
      projectsSlice.map(async project => {
        const { consoleText: logs } = await this.jenkinsApi
          .getBuildConsoleText({
            jobFullName: project.displayName,
            entity: getCompoundEntityRef(entity),
            buildNumber: (project.lastBuild?.number ?? 0).toString(),
          })
          .catch(() => ({ consoleText: '' })) // fallback on empty string. It disables logs button and updates tooltip
          .then(res => res);

        const run = await this.jenkinsApi.getBuild({
          jobFullName: project.displayName,
          entity: getCompoundEntityRef(entity),
          buildNumber: (project.lastBuild?.number ?? 0).toString(),
        });

        const status = mapStatus(project?.status);

        return {
          project,
          run,
          logs,
          status,
        };
      }),
    );

    const results = projectWithLogs.map(
      pr =>
        new PipelineRunResult({
          id: pr?.project?.displayName,
          displayName: pr?.project?.displayName,
          logs: pr?.logs,
          status: pr?.status,
        }),
    );

    return { results, totalCount: projects?.length ?? 0 };
  }

  async getPipelineDetail(options: {
    entity: Entity;
    ref: string;
    page: number;
    pageSize: number;
  }): Promise<MssvApiResponse> {
    const { ref, entity, page, pageSize } = options;
    const job = await this.jenkinsApi.getJobBuilds({
      entity: getCompoundEntityRef(entity),
      jobFullName: ref,
    });

    // Mimic pagination as Jenkins doesn't provide paginated responses
    const [sliceStart, sliceEnd] = [
      page * pageSize,
      page * pageSize + pageSize,
    ];

    const builds = job?.builds ?? [];
    const buildsSlice = builds.slice(sliceStart, sliceEnd);
    // Fetch logs for each project last build
    const buildWithLogs = await Promise.all(
      buildsSlice.map(async run => {
        const { consoleText: logs } = await this.jenkinsApi
          .getBuildConsoleText({
            buildNumber: run.number.toString(),
            jobFullName: ref,
            entity: getCompoundEntityRef(entity),
          })
          .then(res => res);

        return {
          run,
          logs,
        };
      }),
    );

    // Map builds to PipelineRun
    const results =
      buildsSlice.map(run => {
        const buildLogEntry = buildWithLogs.find(b => b?.run?.id === run?.id);
        const logs = buildLogEntry ? buildLogEntry?.logs : '';
        const status = mapStatus(run?.result ?? 'UNKNOWN');
        return new PipelineRunResult({
          id: run?.id?.toString(),
          displayName: run?.id?.toString(),
          logs,
          status,
        });
      }) || [];

    return { results, totalCount: builds?.length ?? 0 };
  }
}
