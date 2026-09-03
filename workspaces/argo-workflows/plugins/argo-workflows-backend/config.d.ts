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
  argoWorkflows?: {
    /**
     * The name of the default Argo Workflows instance to use when no
     * instance name is specified in the entity annotation.
     * Must match one of the names in the `instances` array.
     * @visibility backend
     */
    defaultInstance?: string;

    /**
     * List of Argo Workflows server instances to connect to.
     * @visibility backend
     */
    instances?: Array<{
      /**
       * A unique name identifying this Argo Workflows instance.
       * Referenced by the `argoworkflows.argoproj.io/instance-name`
       * entity annotation and the `defaultInstance` setting.
       * @visibility backend
       */
      name: string;

      /**
       * The base URL of the Argo Workflows server API
       * (e.g. `https://argo.example.com`).
       * Required when using the Argo Workflows server API directly.
       * Mutually exclusive with `kubernetes`.
       * @visibility backend
       */
      baseUrl?: string;

      /**
       * A bearer token used to authenticate with the Argo Workflows API.
       * Typically a Kubernetes service account token with read access
       * to the Argo Workflows resources.
       * Required when `baseUrl` is set.
       * @visibility secret
       */
      token?: string;

      /**
       * Configuration for querying Argo Workflow CRDs via the
       * Kubernetes API using a cluster already configured in the
       * Backstage Kubernetes plugin.
       * Mutually exclusive with `baseUrl`/`token`.
       * @visibility backend
       */
      kubernetes?: {
        /**
         * Name of a cluster configured in the Backstage Kubernetes
         * plugin (`kubernetes.clusters[].name`). The API server URL
         * and credentials are resolved from that configuration.
         * @visibility backend
         */
        clusterName: string;
      };
    }>;
  };
}
