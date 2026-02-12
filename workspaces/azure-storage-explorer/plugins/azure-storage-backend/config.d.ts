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
   * Integrations configuration
   */
  integrations?: {
    /**
     * Azure Blob Storage integrations with allowedContainers support
     */
    azureBlobStorage?: Array<{
      /**
       * Azure storage account name
       */
      accountName?: string;

      /**
       * Account key for authentication
       */
      accountKey?: string;

      /**
       * Shared Access Signature (SAS) token for authentication
       */
      sasToken?: string;

      /**
       * Full connection string for authentication
       */
      connectionString?: string;

      /**
       * Endpoint suffix (e.g., "core.windows.net" for Azure public cloud)
       */
      endpointSuffix?: string;

      /**
       * Custom endpoint URL
       */
      endpoint?: string;

      /**
       * Azure Active Directory credential for authentication
       * @deepVisibility secret
       */
      aadCredential?: {
        /**
         * Client ID of the Azure AD application
         */
        clientId: string;
        /**
         * Tenant ID for Azure AD
         */
        tenantId: string;
        /**
         * Client secret for the Azure AD application
         * @visibility secret
         */
        clientSecret: string;
      };

      /**
       * Optional list of allowed container names. If not specified, all containers are accessible.
       * This is an extension to the standard Backstage Azure Blob Storage integration.
       */
      allowedContainers?: string[];
    }>;
  };

  /**
   * Azure Storage configuration
   * @deprecated Use integrations.azureBlobStorage instead
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
             * Client token (when authType is 'clientToken')
             */
            clientToken: string;
          };

      /**
       * Optional list of allowed container names. If not specified, all containers are accessible.
       */
      allowedContainers?: string[];
    }>;
  };
}
