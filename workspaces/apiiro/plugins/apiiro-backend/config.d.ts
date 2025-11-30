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
   */
  apiiro: {
    /**
     * @visibility secret
     * Bearer access token used to authorize calls to Apiiro REST API.
     */
    accessToken: string;
    /**
     * Permission control configuration for entity access.
     * Controls which entities users can view Apiiro data for.
     * @visibility frontend
     */
    permissionControl?: {
      /**
       * List of entity references to control access for.
       * Supports entity references (e.g., 'component:default/my-service')
       *
       * Examples:
       * - 'component:default/example-website'
       *
       * @items.format entity-ref
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
