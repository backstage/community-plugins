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

import { ServiceNowConnection } from './connection';

type CachedSchema = {
  fields: Set<string>;
  fetchedAt: number;
};

const INCIDENT_TABLE_NAME = 'incident';
const SCHEMA_TTL_MS = 5 * 60 * 1000; // 5 minutes cache timeout

export class ServiceNowSchemaChecker {
  private cache?: CachedSchema;

  constructor(private readonly conn: ServiceNowConnection) {}

  private async fetchIncidentSchema(): Promise<Set<string>> {
    const authHeaders = await this.conn.getAuthHeaders();

    const url = `${this.conn.getInstanceUrl()}/api/now/table/sys_dictionary`;
    const response = await this.conn.getAxiosInstance().get(url, {
      headers: {
        ...authHeaders,
        Accept: 'application/json',
      },
      params: {
        sysparm_query: `name=${INCIDENT_TABLE_NAME}^elementSTARTSWITHu_`,
        sysparm_fields: 'element',
        sysparm_limit: 500,
      },
    });

    const result = response.data?.result ?? [];

    return new Set(result.map((r: any) => r.element));
  }

  private async getIncidentFields(): Promise<Set<string>> {
    const now = Date.now();

    if (this.cache && now - this.cache.fetchedAt < SCHEMA_TTL_MS) {
      return this.cache.fields;
    }

    const fields = await this.fetchIncidentSchema();

    this.cache = {
      fields,
      fetchedAt: now,
    };

    return fields;
  }

  public async fieldExists(...fields: string[]): Promise<boolean> {
    if (fields.length === 0) {
      return true;
    }
    const incidentFields = await this.getIncidentFields();
    return fields.every(field => incidentFields.has(field));
  }
}
