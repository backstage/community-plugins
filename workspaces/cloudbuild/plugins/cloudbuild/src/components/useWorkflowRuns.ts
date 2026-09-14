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
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { cloudbuildApiRef } from '../api/CloudbuildApi';
import {
  ActionsListWorkflowRunsForRepoResponseData,
  Substitutions,
} from '../api/types';
import { useApi, errorApiRef } from '@backstage/core-plugin-api';

export type WorkflowRun = {
  id: string;
  message: string;
  url?: string;
  googleUrl?: string;
  status: string;
  substitutions: Substitutions;
  createTime: string;
  rerun: () => void;
};

export function useWorkflowRuns(options: {
  projectId: string;
  location: string;
  cloudBuildFilter: string;
}) {
  const { projectId, location, cloudBuildFilter } = options;
  const api = useApi(cloudbuildApiRef);
  const errorApi = useApi(errorApiRef);

  const {
    loading,
    value: runs,
    retry,
    error,
  } = useAsyncRetry<WorkflowRun[]>(async () => {
    return api
      .listWorkflowRuns({
        projectId,
        location,
        cloudBuildFilter,
      })
      .then(
        (
          workflowRunsData: ActionsListWorkflowRunsForRepoResponseData,
        ): WorkflowRun[] => {
          return workflowRunsData.builds.map(run => {
            const substitutions = run.substitutions ?? ({} as Substitutions);
            return {
              message: substitutions.REPO_NAME,
              id: run.id,
              rerun: async () => {
                try {
                  await api.reRunWorkflow({
                    projectId,
                    location,
                    runId: run.id,
                  });
                } catch (e) {
                  errorApi.post(e);
                }
              },
              substitutions,
              source: {
                branchName: substitutions.REPO_NAME,
                commit: {
                  hash: substitutions.COMMIT_SHA,
                  url: substitutions.REPO_NAME,
                },
              },
              status: run.status,
              url: run.logUrl,
              googleUrl: run.logUrl,
              createTime: run.createTime,
            };
          });
        },
      );
  }, [api, cloudBuildFilter, errorApi, location, projectId]);

  return [
    {
      loading,
      runs,
      projectName: `${projectId}`,
      error,
    },
    { runs, retry },
  ] as const;
}
