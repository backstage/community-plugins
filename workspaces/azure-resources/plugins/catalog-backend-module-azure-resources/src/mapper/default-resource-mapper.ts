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
import {
  ANNOTATION_EDIT_URL,
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_VIEW_URL,
  Entity,
} from '@backstage/catalog-model';
import { get, merge } from 'lodash';

const AZURE_PORTAL_BASE_URL = 'https://portal.azure.com';
const AZURE_RESOURCE_ID_ANNOTATION = 'management.azure.com/resourceId';
const AZURE_SUBSCRIPTION_ID_ANNOTATION = 'management.azure.com/subscriptionId';
const AZURE_LOCATION_ANNOTATION = 'management.azure.com/location';

/**
 * Recursively applies mapping configuration to transform an object
 * @param source - The source object to extract values from (Azure resource)
 * @param mappingConfig - The mapping configuration object
 * @returns The transformed object with mapped values
 */
function applyMapping(
  source: Record<string, any>,
  mappingConfig: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(mappingConfig)) {
    if (typeof value === 'string') {
      // If the value is a string, treat it as a path to extract from source
      const extractedValue = get(source, value);
      if (extractedValue !== undefined) {
        result[key] = extractedValue;
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // If the value is an object, recurse
      result[key] = applyMapping(source, value);
    } else {
      // For other types (arrays, primitives), use as-is
      result[key] = value;
    }
  }

  return result;
}

function buildPortalUrl(
  tenantId: string | undefined,
  resourceId: string,
): string {
  if (!tenantId) {
    return `${AZURE_PORTAL_BASE_URL}/#/resource${resourceId}`;
  }
  return `${AZURE_PORTAL_BASE_URL}/#@${tenantId}/resource${resourceId}`;
}

function buildDefaultAnnotations(
  res: Record<string, any>,
  providerId: string,
): Record<string, string> {
  const annotations: Record<string, string> = {
    [ANNOTATION_LOCATION]: `arm:${providerId}:${res.id}`,
    [ANNOTATION_ORIGIN_LOCATION]: `arm:${providerId}:${res.id}`,
  };
  if (res.tenantId && res.id) {
    annotations[ANNOTATION_VIEW_URL] = buildPortalUrl(res.tenantId, res.id);
    annotations[ANNOTATION_EDIT_URL] = buildPortalUrl(res.tenantId, res.id);
  }

  if (res.id) {
    annotations[AZURE_RESOURCE_ID_ANNOTATION] = res.id;
  }

  if (res.subscriptionId) {
    annotations[AZURE_SUBSCRIPTION_ID_ANNOTATION] = res.subscriptionId;
  }

  if (res.location) {
    annotations[AZURE_LOCATION_ANNOTATION] = res.location;
  }

  return annotations;
}

/**
 * Creates a default Backstage Entity from an Azure resource
 * @param res - The Azure resource object
 * @param providerId - The unique identifier for the Azure provider
 * @param defaultOwner - Optional default owner to use when resource has no owner tag
 * @returns A default Backstage Entity with standard Azure annotations
 */
function createDefaultEntity(
  res: Record<string, any>,
  providerId: string,
  defaultOwner?: string,
): Entity {
  // Extract owner from tags
  const owner = res.tags?.['backstage.io-owner'] || defaultOwner;

  // Build the default entity structure
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: res.name,
      title: res.name,
      description: res.properties?.description,
      annotations: buildDefaultAnnotations(res, providerId),
    },
    spec: {
      type: res.type,
      owner,
    },
  };
}

export const mapResource = (
  resource: unknown,
  providerId: string,
  mapping?: Record<string, any>,
  defaultOwner?: string,
): Entity | undefined => {
  if (!resource || typeof resource !== 'object') {
    return undefined;
  }

  const res = resource as Record<string, any>;

  const hasRequiredName = res.name || mapping?.metadata?.name;
  const hasRequiredType = res.type || mapping?.spec?.type;

  if (!hasRequiredName || !hasRequiredType) {
    return undefined;
  }

  // Build the default entity structure
  const defaultEntity = createDefaultEntity(res, providerId, defaultOwner);

  // If custom mapping is provided, apply it on top of defaults
  if (mapping) {
    const customMappings = applyMapping(res, mapping);

    // Deep merge custom mappings with default entity
    merge(defaultEntity, customMappings);
  }

  return defaultEntity;
};
