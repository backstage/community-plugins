/*
 * Copyright 2026 The Backstage Authors
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
     * When true, CRUD endpoints for static secrets are enabled.
     * Defaults to false so the plugin is list-and-Console-link only out of the box.
     * Enable only if you intentionally want in-Backstage create/update/delete.
     */
    allowCrud?: boolean;

    authentication?: {
      /**
       * Active authentication method.
       */
      method?: 'accessKey' | 'universalIdentity' | 'cloudIam';

      accessKey?: {
        /**
         * Akeyless access ID.
         * @visibility secret
         */
        accessId: string;
        /**
         * Akeyless access key.
         * @visibility secret
         */
        accessKey: string;
      };

      universalIdentity?: {
        /**
         * Universal Identity token.
         * @visibility secret
         */
        uidToken: string;
      };

      cloudIam?: {
        /**
         * Akeyless access ID used with cloud IAM auth.
         * @visibility secret
         */
        accessId: string;
        provider: 'aws_iam' | 'azure_ad' | 'gcp';
      };
    };
  };
}
