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
  kiali?: {
    providers: Array<{
      name: string;
      /**
       * Url of the cluster API endpoint
       */
      url: string;
      /**
       * Url of the Kiali standalone for external access
       */
      urlExternal?: string;
      /**
       * Service Account Token which is used for querying data from Kiali
       * @visibility secret
       */
      serviceAccountToken?: string;
      /**
       * Skip TLS certificate verification presented by the API server, defaults to false
       */
      skipTLSVerify?: boolean;
      /**
       * Token name to provide to Kiali like the cookie name, defaults to kiali-token-Kubernetes
       */
      tokenName?: string;
      /**
       * Base64-encoded certificate authority bundle in PEM format.
       * @visibility secret
       */
      caData?: string;
      /**
       * Filesystem path (on the host where the Backstage process is running) to a certificate authority bundle in PEM format
       * @visibility secret
       */
      caFile?: string;
      /**
       * Time in seconds that session is enabled, defaults to 1 minute.
       */
      sessionTime?: number;
    }>;
  };
}
