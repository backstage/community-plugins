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

/**
 * Configuration schema for the Azure Resources plugin
 */
export interface Config {
  /**
   * Azure Resources configuration
   */
  azureResources?: {
    /**
     * Azure credentials for accessing Azure Resource Graph API.
     * If not provided, DefaultAzureCredential will be used.
     * @visibility backend
     */
    credentials?: {
      /**
       * Azure Active Directory tenant ID
       * @visibility backend
       */
      tenantId: string;
      /**
       * Azure service principal client ID (application ID)
       * @visibility backend
       */
      clientId: string;
      /**
       * Azure service principal client secret
       * @visibility secret
       */
      clientSecret: string;
    };
  };

  /**
   * Azure Resources configuration (deprecated - use azureResources instead)
   * @deprecated Use azureResources (camelCase) instead
   */
  'azure-resources'?: {
    /**
     * Azure credentials for accessing Azure Resource Graph API.
     * If not provided, DefaultAzureCredential will be used.
     * @visibility backend
     * @deprecated Use azureResources.credentials instead
     */
    credentials?: {
      /**
       * Azure Active Directory tenant ID
       * @visibility backend
       */
      tenantId: string;
      /**
       * Azure service principal client ID (application ID)
       * @visibility backend
       */
      clientId: string;
      /**
       * Azure service principal client secret
       * @visibility secret
       */
      clientSecret: string;
    };
  };
}
