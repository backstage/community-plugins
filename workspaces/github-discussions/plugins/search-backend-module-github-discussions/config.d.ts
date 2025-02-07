/*
 * Copyright 2023 The Backstage Authors
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

import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  search?: {
    collators?: {
      /**
       * Configuration options for `@backstage-community/plugin-search-backend-module-github-discussions`
       */
      githubDiscussions?: {
        /**
         * The base URL of the GitHub repository to fetch discussions from.
         * This is required to define the repository from which the collator
         * will index discussions with its comments replies.
         */
        url: string;
        /**
         * The schedule for how often to run the collation job.
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        /**
         * The base file URI where the cache will be stored.
         *
         * Defaults to `node_modules/github-discussions-fetcher/script/.cache`.
         */
        cacheBase?: string;
        /**
         * Whether to clear the cache after a successful collation run.
         * When enabled, the cache will be cleared after each successful run
         * of `execute()` of the search collator.
         *
         * Defaults to true.
         */
        clearCacheOnSuccess?: boolean;
        /**
         * The batch size for fetching discussions from the repository.
         * It controls how many discussions are queried in a single batch,
         * helping to manage the rate at which API calls are made to avoid
         * exceeding GitHub's rate limits.
         *
         * Defaults to 100.
         */
        discussionsBatchSize?: number;
        /**
         * The batch size for fetching comments from discussions. It
         * controls how many comments are queried in a single batch from
         * discussions.
         *
         * Defaults to 100.
         */
        commentsBatchSize?: number;
        /**
         * The batch size for fetching replies to comments in discussions.
         * It controls how many replies are queried in a single batch from
         * comments.
         *
         * Defaults to 100.
         */
        repliesBatchSize?: number;
      };
    };
  };
}
