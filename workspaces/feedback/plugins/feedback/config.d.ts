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

export interface Config {
  /**
   * @visibility frontend
   */
  feedback?: {
    /**
     * @visibility frontend
     */
    summaryLimit?: number;
    /**
     * @visibility frontend
     */
    baseEntityRef: string;
    /**
     * @visibility frontend
     */
    integrations: {
      /**
       * Configuration options for JIRA integration.
       * It is an array, which can be used to set up multiple jira servers at the same time.
       */
      jira?: Array<{
        /**
         * The hostname or URL of the JIRA organization.
         * @visibility frontend
         */
        host: string;
      }>;
    };
    /**
     * @deepVisibility frontend
     */
    customizations?: object;
  };
}
