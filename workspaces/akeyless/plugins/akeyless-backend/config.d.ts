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
   * Akeyless plugin configuration.
   */
  akeyless?: {
    /**
     * Deployment profile controls which authentication methods are valid.
     * - saas: access key only
     * - onprem: access key or universal identity (UID)
     * - cloud: access key or cloud IAM (aws_iam, azure_ad, gcp)
     */
    deploymentProfile?: 'saas' | 'onprem' | 'cloud';

    /**
     * Akeyless API gateway URL. Use https://api.akeyless.io for SaaS or your
     * self-hosted gateway URL.
     */
    gatewayUrl?: string;

    /**
     * Akeyless Console URL used for deep links. Defaults to https://console.akeyless.io.
     */
    consoleUrl?: string;

    /**
     * When false, CRUD endpoints are disabled and only list operations are allowed.
     * Defaults to true.
     */
    allowCrud?: boolean;

    authentication?: {
      /**
       * Active authentication method.
       */
      method?: 'accessKey' | 'universalIdentity' | 'cloudIam';

      accessKey?: {
        accessId: string;
        accessKey: string;
      };

      universalIdentity?: {
        uidToken: string;
      };

      cloudIam?: {
        accessId: string;
        provider: 'aws_iam' | 'azure_ad' | 'gcp';
      };
    };
  };
}
