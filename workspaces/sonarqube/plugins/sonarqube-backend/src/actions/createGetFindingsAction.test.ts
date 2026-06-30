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
import { createGetFindingsAction } from './createGetFindingsAction';
import {
  SonarqubeInfoProvider,
  SonarqubeFindings,
} from '../service/sonarqubeInfoProvider';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-service',
    namespace: 'default',
    annotations: { 'sonarqube.org/project-key': 'com.example:my-service' },
  },
  spec: { type: 'service', lifecycle: 'production' },
};

const mockFindings: SonarqubeFindings = {
  analysisDate: '2024-01-15T10:30:00+0000',
  measures: [
    { metric: 'alert_status', value: 'OK' },
    { metric: 'bugs', value: '3' },
    { metric: 'coverage', value: '82.5' },
  ],
};

describe('createGetFindingsAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockInfoProvider: jest.Mocked<SonarqubeInfoProvider>;
  let mockCatalog: { getEntityByRef: jest.Mock };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockInfoProvider = {
      getFindings: jest.fn().mockResolvedValue(mockFindings),
      getBaseUrl: jest
        .fn()
        .mockReturnValue({ baseUrl: 'https://sonarqube.example.com' }),
    } as any;

    mockCatalog = {
      getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
    };

    createGetFindingsAction({
      actionsRegistry: mockActionsRegistry as any,
      sonarqubeInfoProvider: mockInfoProvider,
      catalog: mockCatalog as any,
    });
  });

  it('registers the sonarqube:get-findings action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('sonarqube:get-findings');
    expect(reg.attributes.readOnly).toBe(true);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(true);
  });

  it('returns findings for a catalog entity', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { name: 'my-service', kind: 'Component', namespace: 'default' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      { kind: 'Component', namespace: 'default', name: 'my-service' },
      { credentials },
    );
    expect(mockInfoProvider.getFindings).toHaveBeenCalledWith({
      componentKey: 'com.example:my-service',
      instanceName: undefined,
    });
    expect(result.output.componentKey).toBe('com.example:my-service');
    expect(result.output.analysisDate).toBe('2024-01-15T10:30:00+0000');
    expect(result.output.measures).toEqual(mockFindings.measures);
  });

  it('applies default kind and namespace', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      { kind: 'Component', namespace: 'default', name: 'my-service' },
      { credentials },
    );
  });

  it('parses instanceName/projectKey annotation format', async () => {
    mockCatalog.getEntityByRef.mockResolvedValue({
      ...mockEntity,
      metadata: {
        ...mockEntity.metadata,
        annotations: {
          'sonarqube.org/project-key': 'my-instance/com.example:my-service',
        },
      },
    });
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockInfoProvider.getFindings).toHaveBeenCalledWith({
      componentKey: 'com.example:my-service',
      instanceName: 'my-instance',
    });
  });

  it('returns empty measures when findings are undefined', async () => {
    mockInfoProvider.getFindings.mockResolvedValue(undefined);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output.measures).toEqual([]);
    expect(result.output.analysisDate).toBeNull();
  });

  it('throws NotFoundError when entity does not exist', async () => {
    mockCatalog.getEntityByRef.mockResolvedValue(undefined);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { name: 'unknown-service' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws InputError when annotation is missing', async () => {
    mockCatalog.getEntityByRef.mockResolvedValue({
      ...mockEntity,
      metadata: { ...mockEntity.metadata, annotations: {} },
    });
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { name: 'my-service' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(InputError);
  });
});
