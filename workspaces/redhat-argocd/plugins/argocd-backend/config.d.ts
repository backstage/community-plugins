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
  /** ArgoCD Configurations for the Red Hat ArgoCD backend plugin */
  argocd?: {
    /**
     * @visibility secret
     */
    username?: string;
    /**
     * @visibility secret
     */
    password?: string;
    /**
     * The URL to the ArgoCD instance
     * @visibility frontend
     */
    baseUrl?: string;
    /**
     * @visibility secret
     */
    appLocatorMethods?: Array<{
      /**
       * The frontend base url of the ArgoCD instance.
       * @vsibility frontend
       */
      type: string;
      instances: Array<{
        /**
         * @visibility frontend
         */
        name: string;
        /**
         * @visibility frontend
         */
        url: string;
        /**
         * @visibility secret
         */
        token?: string;
        /**
         * @visibility secret
         */
        username?: string;
        /**
         * @visiblity secret
         */
        password?: string;
      }>;
    }>;
  };
}
