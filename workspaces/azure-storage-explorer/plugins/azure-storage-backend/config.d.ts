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
   * Azure Storage configuration
   */
  azureStorage?: {
    /**
     * List of blob storage containers to connect to
     */
    blobContainers?: Array<{
      /**
       * Azure storage account name
       */
      accountName: string;

      /**
       * Authentication type: 'accessToken' (maps to accountKey) or 'clientToken' (maps to aadCredential)
       */
      authType: 'accessToken' | 'clientToken';

      /**
       * Authentication credentials based on authType
       */
      auth:
        | {
            /**
             * Access token (when authType is 'accessToken')
             */
            accessToken: string;
          }
        | {
            /**
             * Azure AD credentials (when authType is 'clientToken')
             */
            clientId: string;
            tenantId: string;
            clientSecret: string;
          };

      /**
       * Optional list of allowed container names. If not specified, all containers are accessible.
       */
      allowedContainers?: string[];
    }>;
  };
}
