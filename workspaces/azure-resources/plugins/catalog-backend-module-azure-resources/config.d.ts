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
import type { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

/**
 * Configuration schema for the Azure Resources catalog provider
 */
export interface Config {
  catalog?: {
    providers?: {
      /**
       * Azure Resources catalog provider configuration
       */
      azureResources?: Array<{
        /**
         * Identifier of the provider which will be used at the location key for ingested entities.
         */
        id: string;

        /**
         * Azure Resource Graph query to fetch resources.
         * This is a Kusto Query Language (KQL) query that will be executed against Azure Resource Graph.
         * @example
         * Resources
         * | where type =~ 'microsoft.storage/storageaccounts'
         * | where location in ('eastus', 'westus2')
         */
        query: string;

        /**
         * Scope configuration specifying which management groups or subscriptions to query.
         * At least one of managementGroups or subscriptions must be specified.
         */
        scope?: {
          /**
           * List of management group IDs to query.
           */
          managementGroups?: string[];

          /**
           * List of subscription IDs to query.
           */
          subscriptions?: string[];
        };

        /**
         * Schedule configuration for refresh tasks.
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;

        /**
         * Optional mapping configuration to customize how Azure resource properties
         * are mapped to Backstage entity fields.
         * Supports dot notation for nested properties (e.g., 'tags.myAnnotation').
         */
        mapping?: {
          /**
           * Mapping for entity metadata fields
           */
          metadata?: {
            /**
             * Property path for entity name
             */
            name?: string;
            /**
             * Property path for entity namespace
             */
            namespace?: string;
            /**
             * Property path for entity title
             */
            title?: string;
            /**
             * Property path for entity description
             */
            description?: string;
            /**
             * Property path for entity labels
             */
            labels?: { [key: string]: string };
            /**
             * Property path for entity annotations
             */
            annotations?: { [key: string]: string };
            /**
             * Property path for entity tags
             */
            tags?: string[];
            /**
             * Property path for entity links
             */
            links?: Array<{
              /**
               * Link URL
               */
              url?: string;
              /**
               * Link title
               */
              title?: string;
              /**
               * Link icon
               */
              icon?: string;
            }>;
          };
          /**
           * Mapping for entity spec fields
           */
          spec?: {
            /**
             * Property path for entity type
             */
            type?: string;
            /**
             * Property path for entity lifecycle
             */
            lifecycle?: string;
            /**
             * Property path for entity owner
             */
            owner?: string;
            /**
             * Property path for entity system
             */
            system?: string;
            /**
             * Property path for entity subcomponentOf
             */
            subcomponentOf?: string;
            /**
             * Property path for entity providesApis
             */
            providesApis?: string[];
            /**
             * Property path for entity consumesApis
             */
            consumesApis?: string[];
            /**
             * Property path for entity dependsOn
             */
            dependsOn?: string[];
            /**
             * Property path for entity dependencyOf
             */
            dependencyOf?: string[];
          };
        };

        /**
         * Optional default owner to assign to entities when no owner information is found in the Azure resource.
         * @example
         * team-platform
         */
        defaultOwner?: string;

        /**
         * Maximum number of pages to fetch from Azure Resource Graph to prevent infinite loops.
         * With a default page size of 1000, this allows controlling how many resources can be retrieved.
         * @defaultValue 100
         */
        maxPages?: number;
      }>;
    };
  };
}
