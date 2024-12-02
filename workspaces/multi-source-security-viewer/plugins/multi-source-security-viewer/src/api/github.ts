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
import {
  GithubActionsApi,
  GITHUB_ACTIONS_ANNOTATION,
  BuildStatus,
} from '@backstage-community/plugin-github-actions';
import { MssvApi, MssvApiResponse } from './mssv';
import { Entity } from '@backstage/catalog-model';
import { createApiRef } from '@backstage/core-plugin-api';
import { PipelineRunResult } from '../models/pipelineRunResult';
import { RunStatus } from '../types/pipelinerun';

// Apiref to map with client
export const mssvGithubActionsApiRef = createApiRef<MssvApi>({
  id: 'plugin.mssv-api-githubactions.service',
});

const mapStatus = (status: string): RunStatus => {
  const runStatus = BuildStatus[status as keyof typeof BuildStatus];
  switch (runStatus) {
    case BuildStatus.success:
      return RunStatus.Succeeded;
    case BuildStatus.failure:
      return RunStatus.Failed;
    case BuildStatus.pending:
      return RunStatus.Pending;
    case BuildStatus.running:
      return RunStatus.Running;
    default:
      return RunStatus.Unknown;
  }
};

export class MssvGithubActionsClient implements MssvApi {
  private readonly githubActionsApi: GithubActionsApi;

  constructor(options: { githubActionsApi: GithubActionsApi }) {
    this.githubActionsApi = options.githubActionsApi;
  }

  async getPipelineSummary(options: {
    entity: Entity;
    page: number;
    pageSize: number;
  }): Promise<MssvApiResponse> {
    const { entity, page, pageSize } = options;
    const [owner, repo] = (
      entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '/'
    ).split('/');

    if (!owner || !repo) {
      return Promise.reject('No repo/owner provided');
    }

    const project = await this.githubActionsApi.listWorkflowRuns({
      owner,
      repo,
      page: page + 1, // non zero-based
      pageSize,
    });

    const projectWithLogs = await Promise.all(
      project.workflow_runs.map(async run => {
        const jobsList = await this.githubActionsApi.listJobsForWorkflowRun({
          owner,
          repo,
          id: run.id,
        });

        const logs = await Promise.all(
          jobsList.jobs.map(async job => {
            return await this.githubActionsApi
              .downloadJobLogsForWorkflowRun({
                owner,
                repo,
                runId: job.id,
              })
              .catch(() => ''); // fallback on empty string. It disables logs button and updates tooltip
          }),
        ).then(res => res.join(' ')); // return as one string

        const status = mapStatus(run?.status ?? 'UNKNOWN');

        return {
          run,
          logs,
          status,
        };
      }),
    );

    const results = projectWithLogs.map(
      pr =>
        new PipelineRunResult({
          id: pr?.run?.id.toString(),
          displayName: pr?.run?.display_title,
          status: pr?.status,
          logs: pr?.logs,
        }),
    );

    return { results, totalCount: project?.total_count ?? 0 };
  }

  async getPipelineDetail(options: {
    entity: Entity;
    ref: string;
    page: number;
    pageSize: number;
  }): Promise<MssvApiResponse> {
    const { entity, ref } = options;
    const [owner, repo] = (
      entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '/'
    ).split('/');

    if (!owner || !repo) {
      return Promise.reject('No repo/owner provided');
    }

    const run = await this.githubActionsApi.getWorkflowRun({
      owner,
      repo,
      id: parseInt(ref, 10),
    });

    const jobsList = await this.githubActionsApi.listJobsForWorkflowRun({
      owner,
      repo,
      id: parseInt(ref, 10),
    });

    const logs = await Promise.all(
      jobsList.jobs.map(async job => {
        return await this.githubActionsApi
          .downloadJobLogsForWorkflowRun({
            owner,
            repo,
            runId: job.id,
          })
          .catch(() => ''); // fallback on empty string. It disables logs button and updates tooltip
      }),
    ).then(res => res.join(' '));

    // This a detail view where only 1 item is expected
    const results = [
      new PipelineRunResult({
        id: run?.id.toString(),
        displayName: run?.display_title,
        status: mapStatus(run?.status ?? 'UNKNOWN'),
        logs,
      }),
    ];

    return { results, totalCount: results?.length ?? 0 };
  }
}
