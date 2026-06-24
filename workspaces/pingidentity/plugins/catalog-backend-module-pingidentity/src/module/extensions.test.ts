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

import { createBackendModule } from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { UserEntity } from '@backstage/catalog-model';
import {
  catalogProcessingExtensionPoint,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { pingIdentityTransformerExtensionPoint } from '../extensions';
import { readPingIdentity } from '../lib/read';
import { PING_IDENTITY_ID_ANNOTATION } from '../lib/constants';
import type { UserTransformer } from '../lib/types';
import { catalogModulePingIdentityEntityProvider } from './catalogModulePingIdentityEntityProvider';
import { PingIdentityEntityProvider } from '../providers/PingIdentityEntityProvider';

jest.mock('../lib/read', () => ({
  ...jest.requireActual('../lib/read'),
  readPingIdentity: jest.fn(),
}));

const readPingIdentityMock = readPingIdentity as jest.MockedFunction<
  typeof readPingIdentity
>;

const CUSTOM_TRANSFORMER_MARKER = 'custom-transformer-wired';

const customUserTransformer: UserTransformer = async (
  entity,
  _pingIdentityUser,
  _envId,
  _groups,
) => {
  entity.metadata.annotations = {
    ...entity.metadata.annotations,
    'pingidentity.test/wired': CUSTOM_TRANSFORMER_MARKER,
  };
  return entity;
};

const providerConfig = {
  catalog: {
    providers: {
      pingIdentityOrg: {
        default: {
          apiPath: 'https://api.test',
          authPath: 'https://auth.test',
          envId: 'envId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          schedule: {
            frequency: { minutes: 30 },
            timeout: { minutes: 3 },
          },
        },
      },
    },
  },
};

const createDoubleSetUserTransformerModule = () =>
  createBackendModule({
    pluginId: 'catalog',
    moduleId: 'pingidentity-test-double-set-user',
    register(reg) {
      reg.registerInit({
        deps: { transformers: pingIdentityTransformerExtensionPoint },
        async init({ transformers }) {
          transformers.setUserTransformer(async entity => entity);
          transformers.setUserTransformer(async entity => entity);
        },
      });
    },
  });

const createDoubleSetGroupTransformerModule = () =>
  createBackendModule({
    pluginId: 'catalog',
    moduleId: 'pingidentity-test-double-set-group',
    register(reg) {
      reg.registerInit({
        deps: { transformers: pingIdentityTransformerExtensionPoint },
        async init({ transformers }) {
          transformers.setGroupTransformer(async entity => entity);
          transformers.setGroupTransformer(async entity => entity);
        },
      });
    },
  });

const createCustomUserTransformerModule = () =>
  createBackendModule({
    pluginId: 'catalog',
    moduleId: 'pingidentity-test-custom-transformer',
    register(reg) {
      reg.registerInit({
        deps: { transformers: pingIdentityTransformerExtensionPoint },
        async init({ transformers }) {
          transformers.setUserTransformer(customUserTransformer);
        },
      });
    },
  });

const scheduler = mockServices.scheduler.mock({
  createScheduledTaskRunner() {
    return { run: jest.fn() };
  },
});

describe('pingIdentityTransformerExtensionPoint', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws when setUserTransformer is called twice', async () => {
    await expect(
      startTestBackend({
        extensionPoints: [
          [catalogProcessingExtensionPoint, { addEntityProvider: jest.fn() }],
        ],
        features: [
          catalogModulePingIdentityEntityProvider,
          createDoubleSetUserTransformerModule(),
          mockServices.rootConfig.factory({ data: providerConfig }),
          scheduler.factory,
        ],
      }),
    ).rejects.toThrow('User transformer may only be set once');
  });

  it('throws when setGroupTransformer is called twice', async () => {
    await expect(
      startTestBackend({
        extensionPoints: [
          [catalogProcessingExtensionPoint, { addEntityProvider: jest.fn() }],
        ],
        features: [
          catalogModulePingIdentityEntityProvider,
          createDoubleSetGroupTransformerModule(),
          mockServices.rootConfig.factory({ data: providerConfig }),
          scheduler.factory,
        ],
      }),
    ).rejects.toThrow('Group transformer may only be set once');
  });

  it('applies a custom user transformer registered via the extension point', async () => {
    let addedProviders: PingIdentityEntityProvider[] = [];
    const extensionPoint = {
      addEntityProvider: (providers: PingIdentityEntityProvider[]) => {
        addedProviders = providers;
      },
    };

    readPingIdentityMock.mockImplementation(async (_client, options) => {
      const baseUser: UserEntity = {
        apiVersion: 'backstage.io/v1beta1',
        kind: 'User',
        metadata: {
          name: 'u1',
          annotations: {
            [PING_IDENTITY_ID_ANNOTATION]: 'uid1',
          },
        },
        spec: { memberOf: [] },
      };

      const userTransformer = options?.userTransformer;
      const transformed = userTransformer
        ? await userTransformer(
            baseUser,
            {
              id: 'uid1',
              username: 'u1',
            } as Parameters<UserTransformer>[1],
            'envId',
            [],
          )
        : baseUser;

      return {
        users: transformed ? [transformed] : [],
        groups: [],
      };
    });

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        createCustomUserTransformerModule(),
        catalogModulePingIdentityEntityProvider,
        mockServices.rootConfig.factory({ data: providerConfig }),
        scheduler.factory,
      ],
    });

    const provider = addedProviders[0];
    const connection: EntityProviderConnection = {
      applyMutation: jest.fn(),
      refresh: jest.fn(),
    };

    await provider.connect(connection);
    await provider.read();

    expect(connection.applyMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                annotations: expect.objectContaining({
                  'pingidentity.test/wired': CUSTOM_TRANSFORMER_MARKER,
                }),
              }),
            }),
          }),
        ],
      }),
    );
  });
});
