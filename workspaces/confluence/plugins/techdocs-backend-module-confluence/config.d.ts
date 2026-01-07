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
 * Configuration for a single Confluence instance
 */
interface ConfluenceInstanceConfig {
  /**
   * The base URL for accessing the Confluence API
   * Typically: https://{org-name}.atlassian.net/wiki
   */
  baseUrl: string;
  /**
   * Confluence API credentials
   */
  auth: {
    /**
     * Authentication method - basic, bearer, or userpass
     */
    type: 'basic' | 'bearer' | 'userpass';
    /**
     * Confluence bearer authentication token with `Read` permissions, only required if type is set to 'basic' or 'bearer'.
     * Reference the Confluence documentation to generate an API token:
     * https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
     * @visibility secret
     */
    token?: string;
    /**
     * Email associated with the token, only required if type is set to 'basic'.
     * @visibility secret
     */
    email?: string;
    /**
     * Confluence basic authentication username, only required if type is set to 'userpass'.
     * While Confluence supports BASIC authentication, using an API token is preferred.
     * See: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
     */
    username?: string;
    /**
     * Confluence basic authentication password, only required if type is set to 'userpass'.
     * While Confluence supports BASIC authentication, using an API token is preferred.
     * See: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
     * @visibility secret
     */
    password?: string;
  };
  /**
   * Options for page tree processing when fetching hierarchical documentation
   */
  pageTree?: {
    /**
     * Enable parallel fetching of child pages. Default: true
     */
    parallel?: boolean;
    /**
     * Maximum depth to traverse when fetching child pages. 0 = unlimited. Default: 0
     */
    maxDepth?: number;
  };
}

export interface Config {
  /**
   * Configuration for Confluence instances.
   * Can be a single instance configuration or multiple named instances.
   *
   * Single instance example:
   * ```yaml
   * confluence:
   *   baseUrl: 'https://company.atlassian.net/wiki'
   *   auth:
   *     type: 'bearer'
   *     token: '${CONFLUENCE_TOKEN}'
   * ```
   *
   * Multiple instances example:
   * ```yaml
   * confluence:
   *   default:
   *     baseUrl: 'https://company.atlassian.net/wiki'
   *     auth:
   *       type: 'bearer'
   *       token: '${CONFLUENCE_TOKEN}'
   *   secondary:
   *     baseUrl: 'https://other-company.atlassian.net/wiki'
   *     auth:
   *       type: 'basic'
   *       token: '${CONFLUENCE_SECONDARY_TOKEN}'
   *       email: 'user@other-company.com'
   * ```
   */
  confluence?:
    | ConfluenceInstanceConfig
    | {
        [instanceName: string]: ConfluenceInstanceConfig;
      };
}
