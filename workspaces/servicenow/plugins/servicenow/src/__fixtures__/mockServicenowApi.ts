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

import { mockRawIncidentApiData } from '../__fixtures__/mockRawIncidentApiData';
import {
  incidentsPickToIncidentsData,
  ServiceNowBackendAPI,
} from '../api/ServiceNowBackendClient';
import { PaginatedIncidentsData } from '../types';

const userEmailToSysId: Record<string, string> = {
  'test@example.com': 'user-sys-id-1',
  'yicai@redhat.com': 'user-sys-id-2',
};

function parseMultiNumberParam(param?: string): number[] {
  if (!param) return [];
  return param
    .split(',')
    .map(p => p.trim().replace(/^IN/, ''))
    .map(Number)
    .filter(n => !isNaN(n));
}

function getSortDirection(order?: string): 'asc' | 'desc' {
  return order === 'desc' ? 'desc' : 'asc';
}

function filterByUserEmail(
  results: typeof mockRawIncidentApiData,
  email?: string,
) {
  if (!email) return results;

  const sysId = userEmailToSysId[email];
  if (!sysId) return [];

  return results.filter(
    i =>
      i.caller_id === sysId || i.opened_by === sysId || i.assigned_to === sysId,
  );
}

export const mockServicenowApi: Partial<ServiceNowBackendAPI> = {
  getIncidents: async (
    queryParams: URLSearchParams,
  ): Promise<PaginatedIncidentsData> => {
    let results = [...mockRawIncidentApiData];

    const get = (key: string) => queryParams.get(key) ?? undefined;

    const userEmail = get('userEmail');
    const search = get('search')?.toLowerCase();
    const priorityParam = get('priority');
    const stateParam = get('state');
    const entityId = get('entityId');
    const orderBy = get('orderBy');
    const order = getSortDirection(get('order'));
    const limit = Number(get('limit') ?? '10');
    const offset = Number(get('offset') ?? '0');

    results = filterByUserEmail(results, userEmail);

    if (search) {
      results = results.filter(
        i =>
          i.number.toLowerCase().includes(search) ||
          i.short_description.toLowerCase().includes(search) ||
          i.description.toLowerCase().includes(search),
      );
    }

    const stateValues = parseMultiNumberParam(stateParam);
    if (stateValues.length > 0) {
      results = results.filter(i => stateValues.includes(i.incident_state));
    }

    const priorityValues = parseMultiNumberParam(priorityParam);
    if (priorityValues.length > 0) {
      results = results.filter(i => priorityValues.includes(i.priority));
    }

    if (entityId) {
      results = results.filter(i => i.u_backstage_entity_id === entityId);
    }

    if (orderBy) {
      results.sort((a, b) => {
        const aVal = String(a[orderBy as keyof typeof a] ?? '');
        const bVal = String(b[orderBy as keyof typeof b] ?? '');
        if (aVal < bVal) return order === 'desc' ? 1 : -1;
        if (aVal > bVal) return order === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const totalCount = results.length;
    const paged = results.slice(offset, offset + limit);

    return {
      incidents: incidentsPickToIncidentsData(paged),
      totalCount,
    };
  },
};
