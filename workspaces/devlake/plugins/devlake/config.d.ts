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
  /** Configuration options for the DevLake plugin */
  devlake?: {
    /**
     * The base URL of the DevLake instance.
     *
     * @visibility frontend
     */
    baseUrl: string;

    /**
     * Team-to-DevLake project mappings.
     *
     * @visibility frontend
     */
    teams?: Array<{
      /**
       * Display name of the team.
       */
      name: string;

      /**
       * The corresponding project name in DevLake.
       */
      devlakeProjectName: string;
    }>;

    /**
     * Optional Grafana integration settings for deep-linking entity cards.
     */
    grafana?: {
      /**
       * Base URL of the Grafana instance (e.g. https://grafana.example.com).
       *
       * @visibility frontend
       */
      baseUrl?: string;

      /**
       * Path to the DORA dashboard in Grafana.
       * Defaults to `/d/qNo8_0M4z/dora`.
       *
       * @visibility frontend
       */
      doraDashboardPath?: string;
    };
  };
}
