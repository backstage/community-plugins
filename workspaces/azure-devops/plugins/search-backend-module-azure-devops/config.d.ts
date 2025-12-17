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

import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  search?: {
    collators?: {
      /**
       * Configuration options for the azure-devops backend module for the search plugin
       */
      azureDevOpsWikiCollator?: {
        /**
         * The schedule for how often to run the collation job.
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        /**
         * URL of your Azure Devops instances; required
         */
        baseUrl: string;
        /**
         * Personal Access Token to authenticate to the Azure DevOps instance; required
         * @visibility secret
         */
        token: string;
        /**
         * Array of one or more wikis to collate
         */
        wikis?: [
          {
            /**
             * The identifier of the wiki. This can be found by looking at the URL of the wiki in Azure DevOps.
             * It is typically something like '{nameOfWiki}.wiki'; required
             */
            wikiIdentifier: string;
            /**
             * The name of the organization the wiki is contained in; required.
             */
            organization: string;
            /**
             * The name of the project the wiki is contained in; required.
             */
            project: string;
            /**
             * A string to append to the title of articles to make them easier to identify as search results from the wiki; optional
             */
            titleSuffix: string;
          },
        ];
      };
    };
  };
}
