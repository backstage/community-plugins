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

import { LoggerService } from '@backstage/backend-plugin-api';
import axios from 'axios';
import {
  IncidentPick,
  PaginatedIncidents,
} from '@backstage-community/plugin-servicenow-common';
import { ServiceNowConnection } from './connection';

const INCIDENT_QUERY_KEYS_ARRAY = [
  'userEmail',
  'u_backstage_entity_id',
  'state',
  'priority',
  'search',
  'limit',
  'offset',
  'order',
  'orderBy',
] as const;

export type IncidentQueryKeyString = (typeof INCIDENT_QUERY_KEYS_ARRAY)[number];

// Plugins specific query parameters (pagination, search, ordering, )
export type PredefinedIncidentQueryParams = {
  [K in IncidentQueryKeyString]?: K extends 'order'
    ? 'asc' | 'desc'
    : K extends 'limit' | 'offset'
    ? number
    : string;
};

// UI-specific query parameters joined with user's custom incident table fields query parameters
export type IncidentQueryParams = PredefinedIncidentQueryParams & {
  [key: string]: any;
};

export type IncidentQueryKeys = keyof IncidentQueryParams;

export function isPredefinedIncidentQueryKey(keyName: string): boolean {
  return INCIDENT_QUERY_KEYS_ARRAY.includes(keyName as IncidentQueryKeyString);
}

export interface ServiceNowClient {
  fetchIncidents(options: IncidentQueryParams): Promise<PaginatedIncidents>;
}

export class DefaultServiceNowClient implements ServiceNowClient {
  constructor(
    private readonly conn: ServiceNowConnection,
    private readonly logger: LoggerService,
  ) {}

  async fetchIncidents(options: IncidentQueryParams): Promise<{
    items: IncidentPick[];
    totalCount: number;
  }> {
    const authHeaders = await this.conn.getAuthHeaders();
    const queryParts: string[] = [];

    const responseFields = [
      ' sys_id',
      'number',
      'short_description',
      'description',
      'sys_created_on',
      'priority',
      'incident_state',
    ];
    for (const [key, value] of Object.entries(options)) {
      if (!isPredefinedIncidentQueryKey(key)) {
        queryParts.push(`${key}=${value}`);
        responseFields.push(key);
      }
    }

    if (options.userEmail) {
      const id = await this.getUserSysIdByEmail(options.userEmail);
      queryParts.push(`caller_id=${id}^ORopened_by=${id}^ORassigned_to=${id}`);
    }

    if (options.state) queryParts.push(`state${options.state}`);
    if (options.priority) queryParts.push(`priority${options.priority}`);

    if (options.search) {
      const searchTerm = options.search;
      queryParts.push(
        `numberLIKE${searchTerm}^ORshort_descriptionLIKE${searchTerm}^ORdescriptionLIKE${searchTerm}`,
      );
    }

    if (options.orderBy) {
      queryParts.push(
        `${options.order === 'desc' ? 'ORDERBYDESC' : 'ORDERBY'}${
          options.orderBy
        }`,
      );
    }

    const sysparmQuery = queryParts.join('^');

    const params = new URLSearchParams();
    if (sysparmQuery) params.append('sysparm_query', sysparmQuery);
    if (options.limit !== undefined)
      params.append('sysparm_limit', String(options.limit));
    if (options.offset !== undefined)
      params.append('sysparm_offset', String(options.offset));

    params.append('sysparm_fields', responseFields.join(','));
    params.append('sysparm_count', 'true');

    const requestUrl = `${this.conn.getInstanceUrl()}/api/now/table/incident?${params.toString()}`;
    this.logger.info(`Fetching incidents from ServiceNow: ${requestUrl}`);

    try {
      const response = await axios.get(requestUrl, {
        headers: {
          ...authHeaders,
          Accept: 'application/json',
        },
        timeout: 30000,
      });

      const countHeader =
        response.headers['x-total-count'] ?? response.headers['X-Total-Count'];
      const totalCount = Number(countHeader ?? 0);

      const items =
        response.data?.result?.map((incident: any) => ({
          ...incident,
          url: `${this.conn.getInstanceUrl()}/nav_to.do?uri=incident.do?sys_id=${
            incident.sys_id
          }`,
        })) ?? [];

      return { items, totalCount };
    } catch (error: any) {
      this.logger.error(`Failed to fetch incidents: ${error.message}`, {
        error,
      });
      throw new Error(`Failed to fetch incidents: ${error.message}`);
    }
  }

  private async getUserSysIdByEmail(email: string): Promise<string | null> {
    const authHeaders = await this.conn.getAuthHeaders();
    const url = `${this.conn.getInstanceUrl()}/api/now/table/sys_user?sysparm_query=email=${encodeURIComponent(
      email,
    )}&sysparm_fields=sys_id`;
    const response = await axios.get(url, {
      headers: {
        ...authHeaders,
        Accept: 'application/json',
      },
    });
    const users = response.data?.result;
    if (users && users.length > 0) return users[0].sys_id;

    throw new Error(`User with email ${email} not found in ServiceNow.`);
  }
}
