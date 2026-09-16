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

import { mockServices } from '@backstage/backend-test-utils';

import { DefaultServiceNowClient } from './client';
import { ServiceNowConnection } from './connection';

describe('DefaultServiceNowClient', () => {
  const instanceUrl = 'https://example.service-now.com';
  let mockGet: jest.Mock;
  let mockConn: jest.Mocked<
    Pick<
      ServiceNowConnection,
      'getAuthHeaders' | 'getAxiosInstance' | 'getInstanceUrl'
    >
  >;
  let client: DefaultServiceNowClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet = jest.fn();
    mockConn = {
      getAuthHeaders: jest
        .fn()
        .mockResolvedValue({ Authorization: 'Bearer t' }),
      getAxiosInstance: jest.fn().mockReturnValue({ get: mockGet }),
      getInstanceUrl: jest.fn().mockReturnValue(instanceUrl),
    };
    client = new DefaultServiceNowClient(
      mockConn as unknown as ServiceNowConnection,
      mockServices.logger.mock(),
    );
  });

  function lastIncidentRequestUrl(): string {
    const incidentCalls = mockGet.mock.calls.filter(([url]: [string]) =>
      String(url).startsWith('api/now/table/incident'),
    );
    expect(incidentCalls.length).toBeGreaterThan(0);
    return String(incidentCalls[incidentCalls.length - 1][0]);
  }

  function parseIncidentParams(url: string): URLSearchParams {
    const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
    return new URLSearchParams(query);
  }

  it('builds sysparm_query for entity filter and pagination params', async () => {
    mockGet.mockResolvedValue({
      data: { result: [] },
      headers: { 'x-total-count': '0' },
    });

    await client.fetchIncidents({
      u_backstage_entity_id: 'component:default/my-service',
      limit: 25,
      offset: 50,
      search: 'outage',
      order: 'desc',
      orderBy: 'number',
    });

    const params = parseIncidentParams(lastIncidentRequestUrl());
    const sysparmQuery = params.get('sysparm_query') ?? '';

    expect(sysparmQuery).toContain(
      'u_backstage_entity_id=component:default/my-service',
    );
    expect(sysparmQuery).toContain('numberLIKEoutage');
    expect(sysparmQuery).toContain('ORDERBYDESCnumber');
    expect(params.get('sysparm_limit')).toBe('25');
    expect(params.get('sysparm_offset')).toBe('50');
    expect(params.get('sysparm_count')).toBe('true');
    expect(params.get('sysparm_fields')).toContain('u_backstage_entity_id');
  });

  it('builds userEmail lookup and caller_id/opened_by/assigned_to fragments', async () => {
    mockGet
      .mockResolvedValueOnce({
        data: { result: [{ sys_id: 'user-sys-id-1' }] },
        headers: {},
      })
      .mockResolvedValueOnce({
        data: { result: [] },
        headers: { 'x-total-count': '0' },
      });

    await client.fetchIncidents({
      userEmail: 'user@example.com',
    });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        'api/now/table/sys_user?sysparm_query=email=user%40example.com',
      ),
      expect.anything(),
    );

    const sysparmQuery =
      parseIncidentParams(lastIncidentRequestUrl()).get('sysparm_query') ?? '';
    expect(sysparmQuery).toContain(
      'caller_id=user-sys-id-1^ORopened_by=user-sys-id-1^ORassigned_to=user-sys-id-1',
    );
  });

  it('appends state and priority IN segments to sysparm_query', async () => {
    mockGet.mockResolvedValue({
      data: { result: [] },
      headers: { 'x-total-count': '0' },
    });

    await client.fetchIncidents({
      state: 'IN1,2',
      priority: 'IN3',
    });

    const sysparmQuery =
      parseIncidentParams(lastIncidentRequestUrl()).get('sysparm_query') ?? '';
    expect(sysparmQuery).toContain('stateIN1,2');
    expect(sysparmQuery).toContain('priorityIN3');
  });

  it('includes custom annotation fields in query and response fields', async () => {
    mockGet.mockResolvedValue({
      data: { result: [] },
      headers: { 'x-total-count': '0' },
    });

    await client.fetchIncidents({
      u_custom_field: 'custom-value',
    });

    const params = parseIncidentParams(lastIncidentRequestUrl());
    expect(params.get('sysparm_query')).toContain(
      'u_custom_field=custom-value',
    );
    expect(params.get('sysparm_fields')).toContain('u_custom_field');
  });

  it('returns items with incident URL prefix and totalCount from x-total-count', async () => {
    mockGet.mockResolvedValue({
      data: {
        result: [
          {
            sys_id: 'abc123',
            number: 'INC001',
            short_description: 'Test',
            description: 'Desc',
            sys_created_on: '2024-01-01',
            priority: 2,
            incident_state: 1,
          },
        ],
      },
      headers: { 'x-total-count': '42' },
    });

    const result = await client.fetchIncidents({ limit: 10 });

    expect(result.totalCount).toBe(42);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        sys_id: 'abc123',
        number: 'INC001',
        url: `${instanceUrl}/nav_to.do?uri=incident.do?sys_id=abc123`,
      }),
    );
  });

  it('rejects when user email is not found', async () => {
    mockGet.mockResolvedValueOnce({
      data: { result: [] },
      headers: {},
    });

    await expect(
      client.fetchIncidents({ userEmail: 'missing@example.com' }),
    ).rejects.toThrow(
      'User with email missing@example.com not found in ServiceNow.',
    );
  });

  it('wraps axios failures when fetching incidents', async () => {
    mockGet.mockRejectedValue(new Error('network down'));

    await expect(client.fetchIncidents({ limit: 1 })).rejects.toThrow(
      'Failed to fetch incidents: network down',
    );
  });
});
