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
import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  catalog?: {
    providers?: {
      ocm?: {
        /**
         * Key is reflected as provider ID. Defines and claims plugin instance ownership of entities
         */
        [key: string]: (
          | {
              /**
               * KubernetesPluginRef
               */
              /**
               * Match the cluster name in kubernetes plugin config
               */
              kubernetesPluginRef: string;
            }
          | {
              /**
               * HubClusterConfig
               */
              /**
               * Url of the hub cluster API endpoint
               */
              url: string;
              /**
               * Name that the hub cluster will assume in Backstage Catalog (in OCM this is always local-cluster which can be confusing)
               */
              name: string;
              /**
               * Service Account Token which is used for querying data from the hub
               * @visibility secret
               */
              serviceAccountToken?: string;
              /**
               * Skip TLS certificate verification presented by the API server, defaults to false
               */
              skipTLSVerify?: boolean;
              /**
               * Base64-encoded CA bundle in PEM format used for verifying the TLS cert presented by the API server
               */
              caData?: string;
            }
        ) & {
          /**
           * Owner reference to created cluster entities in the catalog
           */
          owner?: string;
          schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        };
      };
    };
  };
}
