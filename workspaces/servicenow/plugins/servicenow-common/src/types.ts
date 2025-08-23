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

/**
 * Incident common type - represents a ServiceNow incident, but with limited set of the fields.
 * So, it is not meant to be a complete representation of a ServiceNow incident.
 * This is used to ensure that the incident data is consistent across different parts of the plugin.
 * It should be used in the frontend to display incident data in a consistent way.
 * It is used in the backend to fetch incident data from ServiceNow.
 * @public
 */
export type IncidentPick = {
  sys_id: string;
  number: string;
  short_description: string;
  description: string;
  sys_created_on: string;
  priority: number;
  incident_state: number;
  url: string;
};

/**
 * Enum of incident field keys used in both frontend and backend for sorting and column mapping.
 * These values represent the field names from the ServiceNow incident table.
 * The `url` field is synthesized in the backend to provide a direct link to the incident in ServiceNow UI.
 * @public
 */
export const IncidentFieldEnum = {
  Number: 'number',
  ShortDescription: 'short_description',
  Description: 'description',
  Created: 'sys_created_on',
  Priority: 'priority',
  IncidentState: 'incident_state',
  Url: 'url',
} as const;

/**
 * Enum for sorting order used in incident queries.
 * It aligns with the sorting direction supported by ServiceNow API.
 * @public
 */
export const SortingOrderEnum = {
  Asc: 'asc',
  Desc: 'desc',
} as const;
/**
 * Type helper for `SortingOrderEnum`, representing the entire enum object.
 * @public
 */
export type SortingOrderEnumType = typeof SortingOrderEnum;

/**
 * Union type of possible sorting order values ('asc' | 'desc').
 * Used to enforce valid values in sorting-related parameters.
 * @public
 */
export type Order = SortingOrderEnumType[keyof SortingOrderEnumType];

/**
 * Annotation field name used to associate a Backstage entity with a ServiceNow service or system.
 * This annotation should be added to the entity in the catalog to enable filtering incidents.
 * @example
 * ```yaml
 * metadata:
 *   annotations:
 *     servicenow.com/entity-id: my-service-id
 * ```
 * @public
 */
export const ServiceAnnotationFieldName = 'servicenow.com/entity-id';

/**
 * Represents a paginated response for ServiceNow incidents.
 * Contains the list of incidents for the current page and the total number of incidents matching the query.
 * Used to support pagination in both frontend and backend when displaying or processing incident data.
 * @public
 */
export type PaginatedIncidents = { items: IncidentPick[]; totalCount: number };
