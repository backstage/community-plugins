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
import { createGetQualityGateAction } from './createGetQualityGateAction';
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
    { metric: 'alert_status', value: 'ERROR' },
    { metric: 'bugs', value: '5' },
    { metric: 'vulnerabilities', value: '2' },
    { metric: 'code_smells', value: '14' },
    { metric: 'coverage', value: '75.0' },
    { metric: 'duplicated_lines_density', value: '3.1' },
  ],
};

describe('createGetQualityGateAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockInfoProvider: jest.Mocked<SonarqubeInfoProvider>;
  let mockCatalog: { getEntityByRef: jest.Mock };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockInfoProvider = {
      getFindings: jest.fn().mockResolvedValue(mockFindings),
      getBaseUrl: jest.fn().mockReturnValue({
        baseUrl: 'https://sonarqube.example.com',
        externalBaseUrl: 'https://sonarqube-public.example.com',
      }),
    } as any;

    mockCatalog = {
      getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
    };

    createGetQualityGateAction({
      actionsRegistry: mockActionsRegistry as any,
      sonarqubeInfoProvider: mockInfoProvider,
      catalog: mockCatalog as any,
    });
  });

  it('registers the sonarqube:get-quality-gate action', () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('sonarqube:get-quality-gate');
    expect(reg.attributes.readOnly).toBe(true);
  });

  it('returns quality gate status and key metrics', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output).toMatchObject({
      componentKey: 'com.example:my-service',
      qualityGateStatus: 'ERROR',
      analysisDate: '2024-01-15T10:30:00+0000',
      bugs: '5',
      vulnerabilities: '2',
      codeSmells: '14',
      coverage: '75.0',
      duplicatedLinesDensity: '3.1',
    });
    // Should prefer externalBaseUrl over baseUrl
    expect(result.output.projectUrl).toContain('sonarqube-public.example.com');
    expect(result.output.projectUrl).toContain(
      encodeURIComponent('com.example:my-service'),
    );
  });

  it('returns NONE quality gate status when findings are absent', async () => {
    mockInfoProvider.getFindings.mockResolvedValue(undefined);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output.qualityGateStatus).toBe('NONE');
    expect(result.output.bugs).toBeNull();
  });

  it('throws NotFoundError when entity is missing', async () => {
    mockCatalog.getEntityByRef.mockResolvedValue(undefined);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { name: 'ghost-service' },
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
