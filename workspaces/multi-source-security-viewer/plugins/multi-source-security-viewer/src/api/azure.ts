/*
 * Copyright 2025 The Backstage Authors
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
import { createApiRef } from '@backstage/core-plugin-api';
import {
  AzureDevOpsApi,
  getAnnotationValuesFromEntity,
} from '@backstage-community/plugin-azure-devops';
import {
  BuildResult,
  BuildStatus,
} from '@backstage-community/plugin-azure-devops-common';
import { MssvApi, MssvApiResponse } from './mssv';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { PipelineRunResult } from '../models/pipelineRunResult';
import { RunStatus } from '../types/pipelinerun';

// Apiref to map with client
export const mssvAzureDevopsApiRef = createApiRef<MssvApi>({
  id: 'plugin.mssv-api-azuredevops.service',
});

const mapStatus = (status: string | BuildResult | BuildStatus): RunStatus => {
  const AzureDevopsRunStatus = { ...BuildStatus, ...BuildResult };
  const runStatus =
    AzureDevopsRunStatus[status as keyof typeof AzureDevopsRunStatus];
  switch (runStatus) {
    case BuildResult.Succeeded:
      return RunStatus.Succeeded;
    case BuildResult.Failed:
      return RunStatus.Failed;
    case BuildResult.Canceled:
      return RunStatus.Cancelled;
    case BuildStatus.InProgress:
      return RunStatus.Running;
    default:
      return RunStatus.Unknown;
  }
};

export class MssvAzureDevopsClient implements MssvApi {
  private readonly azureDevopsApi: AzureDevOpsApi;

  constructor(options: { azureDevopsApi: AzureDevOpsApi }) {
    this.azureDevopsApi = options.azureDevopsApi;
  }

  async getPipelineSummary(options: {
    entity: Entity;
    page: number;
    pageSize: number;
  }): Promise<MssvApiResponse> {
    const { entity, page, pageSize } = options;
    const { project, repo, definition, host, org } =
      getAnnotationValuesFromEntity(entity);

    const [sliceStart, sliceEnd] = [
      page * pageSize,
      page * pageSize + pageSize,
    ];

    const buildRuns = (await this.azureDevopsApi.getBuildRuns(
      project,
      stringifyEntityRef(entity),
      repo,
      definition,
      host,
      org,
    )) ?? { items: [] };

    const buildRunsSlice = buildRuns.items.slice(sliceStart, sliceEnd);
    const buildRunsWithLogs = await Promise.all(
      buildRunsSlice
        .map(async run => {
          if (!run?.id) {
            return undefined;
          }

          const logs = await this.azureDevopsApi
            .getBuildRunLog(
              project,
              stringifyEntityRef(entity),
              run.id,
              host,
              org,
            )
            .then(res => res?.log.join(' \n'))
            .catch(() => ''); // fallback on empty string. It disables logs button and updates tooltip

          const status = mapStatus(run?.result ?? run?.status ?? 'Unknown');

          return {
            run,
            logs,
            status,
          };
        })
        .filter(Boolean), // remove undefined values
    );

    const results =
      buildRunsWithLogs.map(
        pr =>
          new PipelineRunResult({
            id: pr?.run?.id?.toString(),
            displayName: pr?.run?.title,
            status: pr?.status,
            logs: pr?.logs,
          }),
      ) || [];

    return {
      results,
      totalCount: buildRuns.items.length,
    };
  }

  async getPipelineDetail(): Promise<MssvApiResponse> {
    return { results: [], totalCount: 0 };
  }
}
