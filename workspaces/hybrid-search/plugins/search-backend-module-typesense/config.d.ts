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
  search?: {
    engines?: {
      typesense?: {
        /**
         * Typesense API key.
         * @visibility secret
         */
        apiKey: string;
        nodes: {
          host: string;
          port: number;
          protocol: string;
          path?: string;
        }[];
        /**
         * Additional raw configuration parameters passed directly to the Typesense Client constructor.
         * E.g. connectionTimeoutSeconds, healthcheckIntervalSeconds, numRetries, etc.
         */
        clientOptions?: Record<string, any>;
        /**
         * Custom raw Typesense Collection schemas and query parameters per type.
         */
        collections?: Record<
          string,
          {
            /**
             * Raw fields array passed directly to Typesense client's collection creation options.
             * Allows configuring custom vector float arrays and machine learning embedding models.
             */
            fields?: Record<string, any>[];
            /**
             * Raw search parameters passed directly to Typesense client search.
             */
            searchOptions?: Record<string, any>;
          }
        >;
      };
    };
  };
}
