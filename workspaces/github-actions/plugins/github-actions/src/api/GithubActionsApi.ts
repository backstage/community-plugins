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

import { RestEndpointMethodTypes } from '@octokit/rest';
import { createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const githubActionsApiRef = createApiRef<GithubActionsApi>({
  id: 'plugin.githubactions.service',
});

/**
 * A client for fetching information about GitHub actions.
 *
 * @public
 */
export type GithubActionsApi = {
  listWorkflowRuns: (options: {
    hostname?: string;
    owner: string;
    repo: string;
    pageSize?: number;
    page?: number;
    branch?: string;
  }) => Promise<
    RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']
  >;

  getWorkflow: (options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
  }) => Promise<
    RestEndpointMethodTypes['actions']['getWorkflow']['response']['data']
  >;

  getWorkflowRun: (options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
  }) => Promise<
    RestEndpointMethodTypes['actions']['getWorkflowRun']['response']['data']
  >;

  reRunWorkflow: (options: {
    hostname?: string;
    owner: string;
    repo: string;
    runId: number;
  }) => Promise<any>;

  listJobsForWorkflowRun: (options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
    pageSize?: number;
    page?: number;
  }) => Promise<
    RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data']
  >;

  downloadJobLogsForWorkflowRun: (options: {
    hostname?: string;
    owner: string;
    repo: string;
    runId: number;
  }) => Promise<
    RestEndpointMethodTypes['actions']['downloadJobLogsForWorkflowRun']['response']['data']
  >;

  listBranches: (options: {
    hostname?: string;
    owner: string;
    repo: string;
    page: number;
  }) => Promise<
    RestEndpointMethodTypes['repos']['listBranches']['response']['data']
  >;

  getDefaultBranch: (options: {
    hostname?: string;
    owner: string;
    repo: string;
  }) => Promise<
    RestEndpointMethodTypes['repos']['get']['response']['data']['default_branch']
  >;
};
