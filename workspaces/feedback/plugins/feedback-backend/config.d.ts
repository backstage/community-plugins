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
   * @visibility frontend
   */
  feedback?: {
    integrations: {
      /**
       * Configuration options for JIRA integration.
       * It is an array, which can be used to set up multiple jira servers at the same time.
       * @visibility frontend
       */
      jira?: Array<{
        /**
         * The hostname or URL of the JIRA organization.
         * @visibility frontend
         */
        host?: string;
        /**
         * The hostname or URL of the JIRA API for the organization, if different from the value set in host.
         * @visibility frontend
         */
        apiHost?: string;
        /**
         * The access token for authenticating with JIRA.
         * @visibility secret
         */
        token?: string;
        /**
         * what type of jira instance are you using, CLOUD/SERVER
         */
        hostType?: string;
      }>;

      /**
       * Configuration options for email integration.
       */
      email?: {
        /**
         * The SMTP server's hostname or IP address.
         */
        host?: string;

        /**
         * The port number to use for the SMTP server.
         */
        port?: number;

        /**
         * Optional authentication settings for the SMTP server.
         */
        auth?: {
          /**
           * The username to use for SMTP server authentication.
           */
          user?: string;

          /**
           * The password to use for SMTP server authentication.
           * @visibility secret
           */
          pass?: string;
        };

        /**
         * Set to `true` if you want to use SSL/TLS for the SMTP connection.
         * Default is `false`.
         */
        secure?: boolean;

        /**
         * The email address from which emails will be sent.
         */
        from?: string;

        /**
         * Path to a custom CA certificate file.
         */
        caCert?: string;
      };
      /**
       * Integrate to the Backstage notifications service
       */
      notifications?: boolean;
    };
  };
}
