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
import { mockServices } from '@backstage/backend-test-utils';

import type { Adapter, Enforcer } from 'casbin';
import type { Router } from 'express';
import type TypeORMAdapter from 'typeorm-adapter';

import type { RBACProvider } from '@backstage-community/plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { RBACPermissionPolicy } from '../policies/permission-policy';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';
import { PolicyBuilder } from './policy-builder';
import {
  extendablePluginIdProviderMock,
  mockPermissionRegistry,
} from '../../__fixtures__/mock-utils';

import { PolicyExtensionPoint } from '@backstage/plugin-permission-node/alpha';

const enforcerMock: Partial<Enforcer> = {
  loadPolicy: jest.fn().mockImplementation(async () => {}),
  enableAutoSave: jest.fn().mockImplementation(() => {}),
  setRoleManager: jest.fn().mockImplementation(() => {}),
  enableAutoBuildRoleLinks: jest.fn().mockImplementation(() => {}),
  buildRoleLinks: jest.fn().mockImplementation(() => {}),
};

jest.mock('casbin', () => {
  const actualCasbin = jest.requireActual('casbin');
  return {
    ...actualCasbin,
    newEnforcer: jest.fn((): Promise<Partial<Enforcer>> => {
      return Promise.resolve(enforcerMock);
    }),
    FileAdapter: jest.fn((): Adapter => {
      return {} as Adapter;
    }),
  };
});

const dataBaseAdapterFactoryMock: Partial<CasbinDBAdapterFactory> = {
  createAdapter: jest.fn((): Promise<TypeORMAdapter> => {
    return Promise.resolve({} as TypeORMAdapter);
  }),
};

jest.mock('../database/casbin-adapter-factory', () => {
  return {
    CasbinDBAdapterFactory: jest.fn((): Partial<CasbinDBAdapterFactory> => {
      return dataBaseAdapterFactoryMock;
    }),
  };
});

const pluginMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
  };

jest.mock('./plugin-endpoints', () => {
  return {
    PluginPermissionMetadataCollector: jest
      .fn()
      .mockImplementation(() => pluginMetadataCollectorMock),
  };
});

const mockRouter: Router = {} as Router;
const policiesServerMock: Partial<PoliciesServer> = {
  serve: jest.fn().mockImplementation(async () => {
    return mockRouter;
  }),
};

jest.mock('./policies-rest-api', () => {
  return {
    PoliciesServer: jest.fn().mockImplementation(() => policiesServerMock),
  };
});

jest.mock('../policies/permission-policy', () => {
  return {
    RBACPermissionPolicy: {
      build: jest.fn((): Promise<RBACPermissionPolicy> => {
        return Promise.resolve({} as RBACPermissionPolicy);
      }),
    },
  };
});

jest.mock('./extendable-id-provider', () => {
  return {
    ExtendablePluginIdProvider: jest
      .fn()
      .mockImplementation(() => extendablePluginIdProviderMock),
  };
});

const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(),
  connect: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

const policyExtensionPointMock: PolicyExtensionPoint = {
  setPolicy: jest.fn().mockImplementation(),
};

describe('PolicyBuilder', () => {
  const backendPluginIDsProviderMock = {
    getPluginIds: jest.fn().mockImplementation(() => {
      return [];
    }),
  };

  const mockLoggerService = mockServices.logger.mock();

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should build policy server', async () => {
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: true,
              rbac: {},
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockServices.discovery.mock(),
        permissions: mockServices.permissions.mock(),
        auth: mockServices.auth.mock(),
        httpAuth: mockServices.httpAuth.mock(),
        auditor: mockServices.auditor.mock(),
        lifecycle: mockServices.lifecycle.mock(),
        permissionsRegistry: mockPermissionRegistry,
        policy: policyExtensionPointMock,
      },
      backendPluginIDsProviderMock,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );
    expect(
      extendablePluginIdProviderMock.handleConflictedPluginIds,
    ).toHaveBeenCalled();
  });

  it('should build policy server with rbac providers', async () => {
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: true,
              rbac: {},
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockServices.discovery.mock(),
        permissions: mockServices.permissions.mock(),
        auth: mockServices.auth.mock(),
        httpAuth: mockServices.httpAuth.mock(),
        auditor: mockServices.auditor.mock(),
        lifecycle: mockServices.lifecycle.mock(),
        permissionsRegistry: mockPermissionRegistry,
        policy: policyExtensionPointMock,
      },
      backendPluginIDsProviderMock,
      [providerMock],
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();
    expect(providerMock.connect).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );
  });

  it('should build policy server, but log warning that permission framework disabled', async () => {
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: false,
              rbac: {},
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockServices.discovery.mock(),
        permissions: mockServices.permissions.mock(),
        auth: mockServices.auth.mock(),
        httpAuth: mockServices.httpAuth.mock(),
        auditor: mockServices.auditor.mock(),
        lifecycle: mockServices.lifecycle.mock(),
        permissionsRegistry: mockPermissionRegistry,
        policy: policyExtensionPointMock,
      },
      backendPluginIDsProviderMock,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).not.toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.warn).toHaveBeenCalledWith(
      'RBAC backend plugin was disabled by application config permission.enabled: false',
    );
  });
});
