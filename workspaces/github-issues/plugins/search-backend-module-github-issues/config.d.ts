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
       * Configuration options for `@community-plugins/search-backend-module-github` collator.
       */
      github?: {
        /**
         * The target that this provider should consume.
         *
         * @example "https://github.com/backstage"
         */
        org: string;
        /**
         * The host configuration for the GitHub instance to search.
         *
         * @default 'github.com'
         */
        host?: string;
        /**
         * The schedule for how often to run the collation job.
         *
         * @default { frequency: { minutes: 10 }, timeout: { minutes: 15 }, initialDelay: { seconds: 3 } }
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        /**
         * Query to search for issues. For more information on the query syntax, see the GitHub documentation.
         * @see https://docs.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests
         *
         * @example 'is:issue is:open org:backstage'
         *
         */
        query: string;
      };
    };
  };
}
