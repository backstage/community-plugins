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
  npm?: {
    /**
     * Use another default registry. This automatically enforce usage of the backend.
     *
     * @visibility frontend
     */
    defaultRegistry?: string;
    /**
     * List of registries that can be used to fetch packages from
     */
    registries?: {
      /**
       * Registry name
       */
      name?: string;
      /**
       * Registry base url
       */
      url?: string;
      /**
       * Registry auth token
       * @visibility secret
       */
      token?: string;
      /**
       * Extra registry headers for non-standard authentification tokens.
       * @deepVisibility secret
       */
      extraRequestHeaders?: {
        [key: string]: string;
      };
    }[];
  };
}
