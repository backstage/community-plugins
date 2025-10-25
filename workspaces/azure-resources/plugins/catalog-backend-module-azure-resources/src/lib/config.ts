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

import { readSchedulerServiceTaskScheduleDefinitionFromConfig } from '@backstage/backend-plugin-api';
import type { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { ResourceEntity } from '@backstage/catalog-model';
import type { Config } from '@backstage/config';

/**
 * Utility type to recursively map all properties of a type to string | undefined
 *
 * @public
 */
export type Mapping<T> = {
  [K in keyof T]: T[K] extends Array<infer I>
    ? Array<Mapping<I>>
    : T[K] extends object
    ? Mapping<T[K]>
    : string | undefined;
};

/**
 * Mapping configuration for Azure resources to Backstage entities.
 *
 * @public
 */
export type AzureResourcesMapping = Partial<Mapping<ResourceEntity>>;

/**
 * Scope configuration for Azure Resource Graph queries.
 *
 * @public
 */
export type AzureResourcesScope = {
  /**
   * List of management group IDs to query.
   * If specified, the query will run against these management groups.
   */
  managementGroups?: string[];

  /**
   * List of subscription IDs to query.
   * If specified, the query will run against these subscriptions.
   */
  subscriptions?: string[];
};

/**
 * The configuration parameters for a single Azure Resources provider.
 *
 * @public
 */
export type AzureResourcesProviderConfig = {
  /**
   * Identifier of the provider which will be used i.e. at the location key for ingested entities.
   */
  id: string;

  /**
   * Azure Resource Graph query to fetch resources.
   * This is a Kusto Query Language (KQL) query that will be executed against Azure Resource Graph.
   *
   * @example
   * ```
   * Resources
   * | where type =~ 'microsoft.storage/storageaccounts'
   * | where location in ('eastus', 'westus2')
   * ```
   */
  query: string;

  /**
   * Scope configuration specifying which management groups or subscriptions to query.
   * If not specified, the query will run against all accessible subscriptions.
   */
  scope?: AzureResourcesScope;

  /**
   * Schedule configuration for refresh tasks.
   */
  schedule?: SchedulerServiceTaskScheduleDefinition;

  /**
   * Optional mapping configuration to customize how Azure resource properties
   * are mapped to Backstage entity fields.
   *
   * Supports dot notation for nested properties (e.g., 'tags.myAnnotation', 'properties.description')
   *
   * @example
   * ```yaml
   * mapping:
   *   metadata:
   *     name: name
   *     annotations:
   *       my-annotation: tags.myAnnotation
   *   spec:
   *     owner: tags['catalog.owner']
   * ```
   */
  mapping?: AzureResourcesMapping;

  /**
   * Optional default owner to assign to entities when no owner information is found in the Azure resource.
   * This is useful when resources don't have owner tags but you want to assign them to a default entity.
   *
   * @example
   * ```yaml
   * defaultOwner: 'team-platform'
   * ```
   */
  defaultOwner?: string;

  /**
   * Maximum number of pages to fetch from Azure Resource Graph to prevent infinite loops.
   * With a default page size of 1000, this allows controlling how many resources can be retrieved.
   *
   * @defaultValue 100 (allowing up to 100,000 resources with default page size)
   *
   * @example
   * ```yaml
   * maxPages: 200
   * ```
   */
  maxPages?: number;
};

export const readProviderConfig = (
  config: Config,
): AzureResourcesProviderConfig => {
  const id = config.getString('id');
  const query = config.getString('query');

  const managementGroups = config.getOptionalStringArray(
    'scope.managementGroups',
  );
  const subscriptions = config.getOptionalStringArray('scope.subscriptions');

  if (!managementGroups && !subscriptions) {
    throw new Error(
      `At least one of 'scope.managementGroups' or 'scope.subscriptions' must be specified for provider '${id}'`,
    );
  }

  // Read schedule configuration
  const schedule = config.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('schedule'),
      )
    : undefined;

  // Read mapping configuration
  const mapping = config.getOptional<AzureResourcesMapping>('mapping');

  // Read default owner configuration
  const defaultOwner = config.getOptionalString('defaultOwner');

  // Read max pages configuration
  const maxPages = config.getOptionalNumber('maxPages');

  return {
    id,
    query,
    scope: {
      managementGroups,
      subscriptions,
    },
    schedule,
    mapping,
    defaultOwner,
    maxPages,
  };
};

/**
 * Reads multiple provider configurations from the root config.
 *
 * @public
 * @param config - The root configuration object
 * @returns An array of Azure Resources provider configurations
 */
export const readProviderConfigs = (config: Config): Config[] | undefined => {
  const providersConfig = config.getOptionalConfigArray(
    'catalog.providers.azureResources',
  );
  return providersConfig;
};
