/*
 * Copyright 2025 The Backstage Authors
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
  jira: {
    /**
     * The proxy path for Jira.
     * Should be used if proxy is in use for security etc purposes.
     * @visibility frontend
     */
    proxyPath: string;

    /**
     * Jira portal Url
     * @visibility frontend
     */
    portalUrl: string;

    /**
     * The verison of the Jira API
     * Should be used if you do not want to use the latest Jira API.
     * @visibility frontend
     */
    apiVersion?: number;

    /**
     * The filtered View with Jira labels and titles to display Jira Chart.
     * @visibility frontend
     */
    filteredViews: {
      /**
       * The Jira Labels to group them in Jira Chart.
       * @visibility frontend
       */
      issueLabels: string;
      /**
       * The title for the Jira Chart.
       * @visibility frontend
       */
      title: string;
    }[];
  };
}
