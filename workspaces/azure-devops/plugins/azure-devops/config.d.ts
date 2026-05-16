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

export interface Config {
  /**
   * Configuration options for the azure-devops-backend plugin
   * @visibility frontend
   */
  azureDevOps?: {
    /**
     * The hostname of the given Azure instance
     * @visibility frontend
     */
    host: string;
    /**
     * The organization of the given Azure instance
     * @visibility frontend
     */
    organization: string;
    /**
     * Pull Request Dashboard config
     * @visibility frontend
     */
    pullRequestDashboard: {
      /**
       * List of organizations to be used in the
       * Pull Request Dashboard's Organization dropdown
       * Each organization should specify both organization name and host
       * @visibility frontend
       */
      organizations: Array<{
        /**
         * Azure DevOps organization name
         * @visibility frontend
         */
        organization: string;
        /**
         * Azure DevOps host URL
         * @visibility frontend
         */
        host: string;
      }>;
    };
  };
}
