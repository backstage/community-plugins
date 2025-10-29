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
import { HumanDuration } from '@backstage/types';

export interface Config {
  search?: {
    collators?: {
      /**
       * Configuration options for `@backstage/plugin-search-backend-module-confluence-collator`
       */
      confluence?: {
        /**
         * The schedule for how often to run the collation job for Confluence.
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
       * Authentication method - basic, bearer, or userpass
       */
      type: 'basic' | 'bearer' | 'userpass';
      /**
       * Confluence bearer authentication token with `Read` permissions, only required if type is set to 'basic' or 'bearer'.
       * Reference the Confluence documentation to generate an API token:
       * https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
       * @visibility secret
       */
      token?: string;
      /**
       * Email associated with the token, only required if type is set to 'basic'.
       * @visibility secret
       */
      email?: string;
      /**
       * Confluence basic authentication username, only required if type is set to 'userpass'.
       * While Confluence supports BASIC authentication, using an API token is preferred.
       * See: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
       */
      username?: string;
      /**
       * Confluence basic authentication password, only required if type is set to 'userpass'.
       * While Confluence supports BASIC authentication, using an API token is preferred.
       * See: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
       * @visibility secret
       */
      password?: string;
    };
    /**
     * Array of Confluence spaces to index. If omitted, all spaces will be indexed.
     * See: https://support.atlassian.com/confluence-cloud/docs/use-spaces-to-organize-your-work/
     */
    spaces?: string[];
    /**
     * CQL query to select the pages to index. It is combined via 'AND' with spaces parameter above when finding documents.
     * Reference the Confluence documentation for information about CQL syntax:
     * https://developer.atlassian.com/server/confluence/advanced-searching-using-cql/
     */
    query?: string;
    /**
     * An abstract value that controls the concurrency level of the
     * collation process. Increasing this value will both increase the
     * number of entities fetched at a time from the catalog, as well as how
     * many things are being processed concurrently.
     *
     * Defaults to `15`.
     * @deprecated Use `maxRequestsPerSecond` instead.
     */
    parallelismLimit?: number;
    /**
     * The maximum number of requests per second to make to the Confluence API.
     * @visibility backend
     */
    maxRequestsPerSecond?: number;
    /**
     * How long to cache Confluence documents. Can be long if you have memory, as cache is keyed by Confluence version info.
     * Example: '24h', '7d', '1h 30m'.
     */
    documentCacheTtl?: HumanDuration;
    /**
     * Set to false to disable all Confluence document caching.
     * Default: false (cache disabled)
     */
    documentCacheEnabled?: boolean;
  };
}
