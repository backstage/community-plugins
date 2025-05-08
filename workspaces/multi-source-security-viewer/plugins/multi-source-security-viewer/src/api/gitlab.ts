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
import { GitlabCIClient } from '@immobiliarelabs/backstage-plugin-gitlab';
import { MssvApi, MssvApiResponse } from './mssv';
import { Entity } from '@backstage/catalog-model';
import {
  DiscoveryApi,
  IdentityApi,
  OAuthApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import { PipelineRunResult } from '../models/pipelineRunResult';
import { GitlabPipelineStatus, RunStatus } from '../types/pipelinerun';

// Apiref to map with client
export const mssvGitlabCIApiRef = createApiRef<MssvApi>({
  id: 'plugin.mssv-api-gitlabci.service',
});

const mapStatus = (status: string): RunStatus => {
  const runStatus =
    GitlabPipelineStatus[status as keyof typeof GitlabPipelineStatus];
  switch (runStatus) {
    case GitlabPipelineStatus.success:
      return RunStatus.Succeeded;
    case GitlabPipelineStatus.failed:
      return RunStatus.Failed;
    case GitlabPipelineStatus.pending:
      return RunStatus.Pending;
    case GitlabPipelineStatus.running:
      return RunStatus.Running;
    default:
      return RunStatus.Unknown;
  }
};

const GITLAB_ANNOTATION_PROJECT_ID = 'gitlab.com/project-id';
const GITLAB_ANNOTATION_PROJECT_SLUG = 'gitlab.com/project-slug';
const GITLAB_ANNOTATION_INSTANCE = 'gitlab.com/instance';

type APIOptions = {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
  codeOwnersPath?: string;
  readmePath?: string;
  gitlabAuthApi: OAuthApi;
  useOAuth?: boolean;
};

export class CustomGitlabCiClient extends GitlabCIClient {
  constructor(options: APIOptions) {
    // gitlabInstance is omitted as it is set through the entity
    super(options as any);
  }

  getPipelineJobs(
    projectId: number | string,
    pipelineId: number,
  ): Promise<any[] | undefined> {
    return this.callApi(
      `projects/${projectId}/pipelines/${pipelineId}/jobs`,
      {},
    );
  }

  getJobLogs(
    projectId: number | string,
    jobId: number,
  ): Promise<string | undefined> {
    return this.callApi(`projects/${projectId}/jobs/${jobId}/trace`, {});
  }
}

export class MssvGitlabCIClient implements Partial<MssvApi> {
  private readonly gitlabCiApi: CustomGitlabCiClient;

  constructor(options: { gitlabCiApi: CustomGitlabCiClient }) {
    this.gitlabCiApi = options.gitlabCiApi;
  }

  async getPipelineSummary(options: {
    entity: Entity;
    page: number;
    pageSize: number;
  }): Promise<MssvApiResponse> {
    const { entity, page, pageSize } = options;

    this.gitlabCiApi.gitlabInstance =
      entity.metadata.annotations?.[GITLAB_ANNOTATION_INSTANCE] ?? 'gitlab.com';

    const projectId =
      entity.metadata.annotations?.[GITLAB_ANNOTATION_PROJECT_ID];

    const projectSlug = encodeURIComponent(
      entity.metadata.annotations?.[GITLAB_ANNOTATION_PROJECT_SLUG] ?? '',
    );

    const [sliceStart, sliceEnd] = [
      page * pageSize,
      page * pageSize + pageSize,
    ];

    const summary =
      (await this.gitlabCiApi.getPipelineSummary(projectId ?? projectSlug)) ??
      [];

    const summarySlice = summary.slice(sliceStart, sliceEnd);
    const summaryWithLogs = await Promise.all(
      summarySlice.map(async run => {
        const pipelineJobs =
          (await this.gitlabCiApi.getPipelineJobs(run.project_id, run.id)) ??
          [];

        const logs = await Promise.all(
          pipelineJobs.map(async job => {
            return await this.gitlabCiApi
              .getJobLogs(run.project_id, job.id)
              .catch(() => ''); // fallback on empty string. It disables logs button and updates tooltip
          }) ?? [],
        ).then(res => res.join(' ')); // return as one
        return { run, logs };
      }),
    );

    const results =
      summaryWithLogs.map(
        pr =>
          new PipelineRunResult({
            id: pr?.run?.id.toString(),
            displayName: pr?.run?.id.toString(),
            status: mapStatus(pr?.run?.status ?? 'UNKOWN'),
            logs: pr?.logs,
          }),
      ) || [];

    return { results, totalCount: summary?.length ?? 0 };
  }

  async getPipelineDetail(): Promise<MssvApiResponse> {
    return { results: [], totalCount: 0 };
  }
}
