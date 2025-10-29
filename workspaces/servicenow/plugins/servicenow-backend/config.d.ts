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

type BaseOAuthConfig = {
  clientId: string;
  clientSecret: string;
  tokenUrl?: string;
};

type ClientCredentialsGrant = BaseOAuthConfig & {
  grantType: 'client_credentials';
};

type PasswordGrant = BaseOAuthConfig & {
  grantType: 'password';
  username: string;
  password: string;
};

export type OAuthConfig = ClientCredentialsGrant | PasswordGrant;

export type BasicAuthConfig = {
  username: string;
  password: string;
};

export interface ServiceNowConfig {
  servicenow?: {
    /**
     * The instance URL for ServiceNow.
     * @visibility backend
     */
    instanceUrl: string;
    /**
     * @visibility secret
     */
    basicAuth?: BasicAuthConfig;
    /**
     * @visibility secret
     */
    oauth?: OAuthConfig;
  };
}
