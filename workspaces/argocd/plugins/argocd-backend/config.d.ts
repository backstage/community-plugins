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
  /** ArgoCD Configurations for the ArgoCD backend plugin */
  argocd?: {
    /**
     * Default username used when an instance has no token or username.
     * @visibility backend
     */
    username?: string;
    /**
     * Default password used when an instance has no token or password.
     * @visibility secret
     */
    password?: string;
    /**
     * The URL to the ArgoCD instance
     * @visibility backend
     */
    baseUrl?: string;
    /**
     * @visibility backend
     */
    appLocatorMethods?: Array<{
      /**
       * Locator type. Use `config` to load instances from this file.
       * @visibility backend
       */
      type: string;
      instances: Array<{
        /**
         * @visibility backend
         */
        name: string;
        /**
         * @visibility backend
         */
        url: string;
        /**
         * Instance access token. Preferred over username/password when set.
         * @visibility secret
         */
        token?: string;
        /**
         * Instance username. Used when token is not set.
         * @visibility secret
         */
        username?: string;
        /**
         * Instance password. Used when token is not set.
         * @visibility secret
         */
        password?: string;
      }>;
    }>;
  };
}
