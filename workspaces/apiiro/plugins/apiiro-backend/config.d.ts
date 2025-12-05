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
  /**
   * Apiiro plugin configuration.
   * @visibility frontend
   */
  apiiro?: {
    /**
     * Bearer access token used to authorize calls to Apiiro REST API.
     * @visibility secret
     */
    accessToken: string;
    /**
     * Default value for the allow metrics view annotation
     * @visibility frontend
     * @default true
     */
    defaultAllowMetricsView?: boolean;
    /**
     * Permission control configuration for metric view access.
     * Controls which entities users can view metrics for.
     * @visibility frontend
     */
    permissionControl?: {
      /**
       * List of entity references to control access for.
       * Supports entity references (e.g., 'component:default/my-service')
       *
       * Examples:
       * - 'component:default/example-website'
       */
      entityNames: string[];

      /**
       * Determines the permission control mode:
       * - true (blocklist mode): Allow all entities EXCEPT those listed in entityNames
       * - false (allowlist mode): Deny all entities EXCEPT those listed in entityNames
       *
       * @default true
       */
      exclude?: boolean;
    };
  };
}
