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
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { InputError, NotFoundError } from '@backstage/errors';
import { createListIncidentsAction } from './createListIncidentsAction';
import { ServiceNowClient } from '../service-now-rest/client';

const mockIncidents = [
  {
    sys_id: 'INC0001',
    number: 'INC0001234',
    short_description: 'Database connection failure',
    description: 'The database connection is failing intermittently.',
    sys_created_on: '2024-01-15 10:30:00',
    priority: 1,
    incident_state: 1,
    url: 'https://instance.servicenow.com/nav_to.do?uri=incident.do?sys_id=INC0001',
  },
  {
    sys_id: 'INC0002',
    number: 'INC0001235',
    short_description: 'API latency spike',
    description: 'The API response times are unusually high.',
    sys_created_on: '2024-01-16 09:00:00',
    priority: 2,
    incident_state: 2,
    url: 'https://instance.servicenow.com/nav_to.do?uri=incident.do?sys_id=INC0002',
  },
];

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'System',
  metadata: {
    name: 'my-service',
    namespace: 'default',
    annotations: { 'servicenow.com/entity-id': 'sn-entity-abc123' },
  },
  spec: { type: 'service', lifecycle: 'production' },
};

describe('createListIncidentsAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockServiceNowClient: jest.Mocked<ServiceNowClient>;
  let mockCatalog: { getEntityByRef: jest.Mock };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockServiceNowClient = {
      fetchIncidents: jest
        .fn()
        .mockResolvedValue({ items: mockIncidents, totalCount: 2 }),
    };

    mockCatalog = {
      getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
    };

    createListIncidentsAction({
      actionsRegistry: mockActionsRegistry as any,
      serviceNowClient: mockServiceNowClient,
      catalog: mockCatalog as any,
    });
  });

  it('registers the servicenow:list-incidents action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('servicenow:list-incidents');
    expect(reg.attributes.readOnly).toBe(true);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(true);
  });

  it('returns incidents with defaults for limit and offset', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];

    const result = await reg.action({
      input: { name: 'my-service' },
      credentials: mockCredentials.user(),
      logger: mockServices.logger.mock(),
    });

    expect(mockServiceNowClient.fetchIncidents).toHaveBeenCalledWith({
      u_backstage_entity_id: 'sn-entity-abc123',
      userEmail: undefined,
      state: undefined,
      priority: undefined,
      search: undefined,
      limit: 10,
      offset: 0,
      order: undefined,
      orderBy: undefined,
    });
    expect(result.output.totalCount).toBe(2);
    expect(result.output.incidents).toHaveLength(2);
    expect(result.output.incidents[0].sys_id).toBe('INC0001');
    expect(result.output.incidents[0].priority).toBe(1);
  });

  it('resolves entity name to ServiceNow entity ID via annotation', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      'system:default/my-service',
      { credentials },
    );
    expect(mockServiceNowClient.fetchIncidents).toHaveBeenCalledWith(
      expect.objectContaining({
        u_backstage_entity_id: 'sn-entity-abc123',
      }),
    );
    expect(result.output.totalCount).toBe(2);
  });

  it('uses provided kind and namespace when resolving the entity', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: { name: 'my-service', kind: 'Service', namespace: 'my-ns' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      'service:my-ns/my-service',
      { credentials },
    );
  });

  it('always resolves entity from catalog using name', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: { name: 'my-service', search: 'database' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      'system:default/my-service',
      { credentials },
    );
    expect(mockServiceNowClient.fetchIncidents).toHaveBeenCalledWith(
      expect.objectContaining({ u_backstage_entity_id: 'sn-entity-abc123' }),
    );
  });

  it('throws NotFoundError when entity does not exist', async () => {
    mockCatalog.getEntityByRef.mockResolvedValue(undefined);
    const reg = mockActionsRegistry.register.mock.calls[0][0];

    await expect(
      reg.action({
        input: { name: 'unknown' },
        credentials: mockCredentials.user(),
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws InputError when entity is missing the servicenow.com/entity-id annotation', async () => {
    mockCatalog.getEntityByRef.mockResolvedValue({
      ...mockEntity,
      metadata: { ...mockEntity.metadata, annotations: {} },
    });
    const reg = mockActionsRegistry.register.mock.calls[0][0];

    await expect(
      reg.action({
        input: { name: 'my-service' },
        credentials: mockCredentials.user(),
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(InputError);
  });

  it('passes all optional filters to fetchIncidents', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];

    await reg.action({
      input: {
        name: 'my-service',
        state: '1,2',
        priority: '1',
        search: 'database',
        limit: 25,
        offset: 50,
        order: 'desc',
        orderBy: 'sys_created_on',
        userEmail: 'alice@example.com',
      },
      credentials: mockCredentials.user(),
      logger: mockServices.logger.mock(),
    });

    expect(mockServiceNowClient.fetchIncidents).toHaveBeenCalledWith({
      u_backstage_entity_id: 'sn-entity-abc123',
      userEmail: 'alice@example.com',
      state: 'IN1,2',
      priority: 'IN1',
      search: 'database',
      limit: 25,
      offset: 50,
      order: 'desc',
      orderBy: 'sys_created_on',
    });
  });

  it('returns empty list when no incidents found', async () => {
    mockServiceNowClient.fetchIncidents.mockResolvedValue({
      items: [],
      totalCount: 0,
    });
    const reg = mockActionsRegistry.register.mock.calls[0][0];

    const result = await reg.action({
      input: { name: 'my-service', search: 'no-match' },
      credentials: mockCredentials.user(),
      logger: mockServices.logger.mock(),
    });

    expect(result.output.totalCount).toBe(0);
    expect(result.output.incidents).toHaveLength(0);
  });
});
