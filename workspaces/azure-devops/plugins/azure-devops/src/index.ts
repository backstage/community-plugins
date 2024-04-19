/*
 * Copyright 2021 The Backstage Authors
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

export {
  azureDevOpsPlugin,
  EntityAzurePipelinesContent,
  EntityAzureGitTagsContent,
  EntityAzurePullRequestsContent,
  EntityAzureReadmeCard,
  isAzureDevOpsAvailable,
  isAzurePipelinesAvailable,
  AzurePullRequestsPage,
} from './plugin';

export { AzurePullRequestsIcon } from './components/AzurePullRequestsIcon';

export * from './api';

export { FilterType } from './components/PullRequestsPage';
export type {
  PullRequestColumnConfig,
  BaseFilter,
  Filter,
  PullRequestFilter,
  AssignedToUserFilter,
  CreatedByUserFilter,
  AssignedToTeamFilter,
  CreatedByTeamFilter,
  AssignedToTeamsFilter,
  CreatedByTeamsFilter,
  AllFilter,
} from './components/PullRequestsPage';
