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
import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  search?: {
    collators?: {
      /**
       * Configuration options for `@backstage/plugin-search-backend-module-techdocs`
       */
      confluence?: {
        /**
         * The schedule for how often to run the collation job.
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
      };
    };
  };
  confluence?: {
    /**
     * The base URL for accessing the Confluence API
     * Typically: https://{org-name}.atlassian.net/wiki
     */
    baseUrl: string;
    /**
     * Confluence API credentials
     */
    auth: {
      /**
       * Authentication method - basic, userpass
       */
      type: 'basic' | 'bearer' | 'userpass';
      /**
       * Confluence bearer authentication token
       * @visibility secret
       */
      token?: string;
      /**
       * Email used with the token for the basic auth method
       * @visibility secret
       */
      email?: string;
      /**
       * Confluence basic authentication username.
       * While Confluence supports BASIC authentication, using an API token is preferred.
       * See: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
       */
      username?: string;
      /**
       * Confluence basic authentication password.
       * While Confluence supports BASIC authentication, using an API token is preferred.
       * See: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
       * @visibility secret
       */
      password?: string;
    };
    /**
     * Spaces to index
     */
    spaces?: string[];
    /**
     * CQL query to select the pages to index. It is combined with spaces parameter above when finding documents.
     */
    query?: string;
    /**
     * An abstract value that controls the concurrency level of the
     * collation process. Increasing this value will both increase the
     * number of entities fetched at a time from the catalog, as well as how
     * many things are being processed concurrently.
     *
     * Defaults to `15`.
     */
    parallelismLimit?: number;
  };
}
