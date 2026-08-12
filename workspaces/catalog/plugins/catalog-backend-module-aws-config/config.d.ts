/*
 * Copyright 2020 The Backstage Authors
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

import { HumanDuration } from '@backstage/types';

export interface Config {
  catalog?: {
    providers?: {
      /**
       * AwsConfigInfrastructureProvider configuration
       */
      awsConfig?: {
        [name: string]: {
          /**
           * (Optional) AWS Config aggregator name to use
           * If not set, an aggregator will not be used
           * @see https://docs.aws.amazon.com/config/latest/developerguide/aggregate-data.html
           */
          aggregator?: string;
          /**
           * (Optional) AWS Region.
           * If not set, AWS_REGION environment variable or aws config file will be used.
           * @see https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html
           */
          region?: string;
          /**
           * (Optional) AWS Account id.
           * If not set, main account is used.
           * @see https://github.com/backstage/backstage/blob/master/packages/integration-aws-node/README.md
           */
          accountId?: string;
          /**
           * (Optional) Enable hashed entity names to prevent length > 63 characters.
           * If not set, entity names are not hashed
           * @see https://github.com/backstage/backstage/blob/master/packages/integration-aws-node/README.md
           */
          hashEntityNames?: boolean;
          /**
           * (Required) Filters to apply in AWS Config query
           */
          filters: {
            /**
             * (Optional) Filter AWS Config resources using these tags
             * If not set, no tag filters will be applied
             */
            tags?: {
              /**
               * (Required) Key of the tag to filter on
               */
              key: string;
              /**
               * (Optional) Value of the tag to filter on
               * If not set, only the key of the tag fill be used
               */
              value?: string;
            }[];
            /**
             * (Required) List of AWS Config resource types to retrieve
             * @see https://docs.aws.amazon.com/config/latest/developerguide/resource-config-reference.html
             */
            resourceTypes: string[];
          };
          /**
           * (Optional) Transforms that will be applied to the emitted entity
           * If not set, no transforms will be applied
           */
          transform?: {
            /**
             * (Optional) Transforms that will be applied to specific fields of the emitted entity
             * If not set, no field-level transforms will be applied
             */
            fields?: {
              /**
               * (Optional) Transforms for the spec field of the entity
               * If not set, no transforms will be applied to the spec field
               */
              spec?: {
                /**
                 * (Optional) Transforms for the spec.owner field of the entity
                 * If not set, no transforms will be applied to the spec.owner field
                 */
                owner?: {
                  /**
                   * (Optional) Propagates the value of this tag to the field
                   * If not set, no tag will be propagated
                   */
                  tag?: string;
                  /**
                   * (Optional) Sets the value of the field to this value
                   * If not set, no value will be set
                   */
                  value?: string;
                  /**
                   * (Optional) Sets the value of the field to the result of this JSONata expression
                   * If not set, no value will be set
                   */
                  expression?: string;
                };
                /**
                 * (Optional) Transforms for the spec.system field of the entity
                 * If not set, no transforms will be applied to the spec.owner field
                 */
                system?: {
                  /**
                   * (Optional) Propagates the value of this tag to the field
                   * If not set, no tag will be propagated
                   */
                  tag?: string;
                  /**
                   * (Optional) Sets the value of the field to this value
                   * If not set, no value will be set
                   */
                  value?: string;
                  /**
                   * (Optional) Sets the value of the field to the result of this JSONata expression
                   * If not set, no value will be set
                   */
                  expression?: string;
                };
                /**
                 * (Optional) Transforms the entity to add a dependencyOf on a component
                 * If not set, no transforms will be applied to create the dependencyOf
                 */
                component?: {
                  /**
                   * (Optional) Propagates the value of this tag to the field
                   * If not set, no tag will be propagated
                   */
                  tag?: string;
                  /**
                   * (Optional) Sets the value of the field to this value
                   * If not set, no value will be set
                   */
                  value?: string;
                  /**
                   * (Optional) Sets the value of the field to the result of this JSONata expression
                   * If not set, no value will be set
                   */
                  expression?: string;
                };
                /**
                 * (Optional) Transforms for the spec.type field of the entity
                 * If not set, no transforms will be applied to the spec.type field
                 */
                type?: {
                  /**
                   * (Optional) Propagates the value of this tag to the field
                   * If not set, no tag will be propagated
                   */
                  tag?: string;
                  /**
                   * (Optional) Sets the value of the field to this value
                   * If not set, no value will be set
                   */
                  value?: string;
                  /**
                   * (Optional) Sets the value of the field to the result of this JSONata expression
                   * If not set, no value will be set
                   */
                  expression?: string;
                };
              };
              /**
               * (Optional) Transforms for the metadata.annotations field of the entity
               * If not set, no transforms will be applied to the metadata.annotations field
               */
              annotations?: {
                [name: string]: {
                  /**
                   * (Optional) Propagates the value of this tag to the field
                   * If not set, no tag will be propagated
                   */
                  tag?: string;
                  /**
                   * (Optional) Sets the value of the field to this value
                   * If not set, no value will be set
                   */
                  value?: string;
                  /**
                   * (Optional) Sets the value of the field to the result of this JSONata expression
                   * If not set, no value will be set
                   */
                  expression?: string;
                };
              };
              /**
               * (Optional) Transforms for the metadata.name field of the entity
               * If not set, no transforms will be applied to the metadata.name field
               */
              name?: {
                /**
                 * (Optional) Propagates the value of this tag to the field
                 * If not set, no tag will be propagated
                 */
                tag?: string;
                /**
                 * (Optional) Sets the value of the field to this value
                 * If not set, no value will be set
                 */
                value?: string;
                /**
                 * (Optional) Sets the value of the field to the result of this JSONata expression
                 * If not set, no value will be set
                 */
                expression?: string;
              };
            };
          };
          /**
           * (Optional) Configure ingestion behavior
           * If not set, default configuration will be used
           */
          options?: {
            /**
             * (Optional) Sets the page size of results from AWS Config
             * If not set, page size will be 100
             */
            pageSize?: number;
            /**
             * (Optional) Configure incremental ingestion behavior
             * If not set, default configuration will be used
             */
            incremental?: {
              /**
               * (Optional) Length of each burst of entity ingestion
               * If not set, burst length will be 3 seconds
               */
              burstLength?: HumanDuration;
              /**
               * (Optional) Time to wait between each burst
               * If not set, burst interval will be 3 seconds
               */
              burstInterval?: HumanDuration;
              /**
               * (Optional) Time to wait between ingestion run
               * If not set, rest length will be 1 day
               */
              restLength?: HumanDuration;
            };
          };
        };
      };
    };
  };
}
