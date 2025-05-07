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
  permission: {
    rbac: {
      'policies-csv-file'?: string;
      /**
       * The path to the yaml file containing the conditional policies
       * @visibility frontend
       */
      conditionalPoliciesFile?: string;
      /**
       * Allow for reloading of the CSV and conditional policies files.
       * @visibility frontend
       */
      policyFileReload?: boolean;
      /**
       * Optional configuration for admins
       * @visibility frontend
       */
      admin?: {
        /**
         * The list of users and / or groups with admin access
         * @visibility frontend
         */
        users?: Array<{
          /**
           * @visibility frontend
           */
          name: string;
        }>;
        /**
         * The list of super users that will have allow all access, should be a list of only users
         * @visibility frontend
         */
        superUsers?: Array<{
          /**
           * @visibility frontend
           */
          name: string;
        }>;
      };
      /**
       * An optional list of plugin IDs.
       * The RBAC plugin will handle access control for plugins included in this list.
       */
      pluginsWithPermission?: string[];
      /**
       * An optional value that limits the depth when building the hierarchy group graph
       * @visibility frontend
       */
      maxDepth?: number;
      /**
       * Optional configuration for default user permissions
       * @visibility frontend
       */
      defaultUserAccess?: {
        /**
         * Enable or disable the default access feature
         * @visibility frontend
         */
        enabled: boolean;
        /**
         * The list of default permissions to apply to users with no explicit permissions
         * @visibility frontend
         */
        defaultPermissions: Array<{
          /**
           * The permission resource type or permission name
           * @visibility frontend
           */
          permission: string;
          /**
           * The policy type (e.g., read, write, delete)
           * @visibility frontend
           */
          policy: string;
          /**
           * The effect of the permission (allow or deny)
           * @visibility frontend
           */
          effect: 'allow' | 'deny';
        }>;
      };
    };
  };
}
