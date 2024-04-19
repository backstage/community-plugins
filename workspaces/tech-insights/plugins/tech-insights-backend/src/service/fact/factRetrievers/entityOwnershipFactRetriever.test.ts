/*
 * Copyright 2021 The Backstage Authors
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

import { entityOwnershipFactRetriever } from './entityOwnershipFactRetriever';
import { RELATION_OWNED_BY } from '@backstage/catalog-model';
import {
  PluginEndpointDiscovery,
  getVoidLogger,
  ServerTokenManager,
} from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { GetEntitiesResponse } from '@backstage/catalog-client';
import { mockServices } from '@backstage/backend-test-utils';

const getEntitiesMock = jest.fn();
jest.mock('@backstage/catalog-client', () => {
  return {
    CatalogClient: jest
      .fn()
      .mockImplementation(() => ({ getEntities: getEntitiesMock })),
  };
});
const discovery: jest.Mocked<PluginEndpointDiscovery> = {
  getBaseUrl: jest.fn(),
  getExternalBaseUrl: jest.fn(),
};

const defaultEntityListResponse: GetEntitiesResponse = {
  items: [
    {
      apiVersion: 'backstage.io/v1beta1',
      metadata: {
        name: 'service-with-owner',
        description: 'service with an owner',
        tags: ['a-tag'],
        annotations: {
          'backstage.io/techdocs-ref': 'dir:.',
        },
      },
      kind: 'Component',
      spec: {
        type: 'service',
        lifecycle: 'test',
        owner: 'team-a',
      },
      relations: [
        {
          type: RELATION_OWNED_BY,
          targetRef: 'group:default/team-a',
        },
      ],
    },
    {
      apiVersion: 'backstage.io/v1beta1',
      metadata: {
        name: 'service-with-incomplete-data',
        description: '',
        tags: [],
      },
      kind: 'Component',
      spec: {
        type: 'service',
        lifecycle: 'test',
        owner: '',
      },
    },
    {
      apiVersion: 'backstage.io/v1beta1',
      metadata: {
        name: 'service-with-user-owner',
      },
      kind: 'Component',
      spec: {
        type: 'service',
        lifecycle: 'test',
        owner: 'user:my-user',
      },
    },
    {
      apiVersion: 'backstage.io/v1beta1',
      metadata: {
        name: 'user-a',
      },
      kind: 'User',
      spec: {
        memberOf: 'group-a',
      },
    },
  ],
};

const handlerContext = {
  discovery,
  logger: getVoidLogger(),
  auth: mockServices.auth(),
  config: ConfigReader.fromConfigs([]),
  tokenManager: ServerTokenManager.noop(),
};

const entityFactRetriever = entityOwnershipFactRetriever;

describe('entityFactRetriever', () => {
  beforeEach(() => {
    getEntitiesMock.mockResolvedValue(defaultEntityListResponse);
  });
  afterEach(() => {
    getEntitiesMock.mockClear();
  });

  describe('hasOwner', () => {
    describe('where the entity has an owner in the spec', () => {
      it('returns true for hasOwner', async () => {
        const facts = await entityFactRetriever.handler(handlerContext);
        expect(
          facts.find(it => it.entity.name === 'service-with-owner'),
        ).toMatchObject({
          facts: {
            hasOwner: true,
          },
        });
      });
    });
    describe('where the entity has an empty value for owner in the spec', () => {
      it('returns false for hasOwner', async () => {
        const facts = await entityFactRetriever.handler(handlerContext);
        expect(
          facts.find(it => it.entity.name === 'service-with-incomplete-data'),
        ).toMatchObject({
          facts: {
            hasOwner: false,
          },
        });
      });
    });

    describe('where the entity doesn not have an owner in the spec', () => {
      it('returns false for hasOwner', async () => {
        const facts = await entityFactRetriever.handler(handlerContext);
        expect(facts.find(it => it.entity.name === 'user-a')).toMatchObject({
          facts: {
            hasOwner: false,
          },
        });
      });
    });
  });
  describe('hasGroupOwner', () => {
    describe('where the entity has an group as owner in the spec', () => {
      it('returns true for hasGroupOwner', async () => {
        const facts = await entityFactRetriever.handler(handlerContext);
        expect(
          facts.find(it => it.entity.name === 'service-with-owner'),
        ).toMatchObject({
          facts: {
            hasGroupOwner: true,
          },
        });
      });
    });
    describe('where the entity has a user as owner in the spec', () => {
      it('returns false for hasGroupOwner', async () => {
        const facts = await entityFactRetriever.handler(handlerContext);
        expect(
          facts.find(it => it.entity.name === 'service-with-user-owner'),
        ).toMatchObject({
          facts: {
            hasGroupOwner: false,
          },
        });
      });
    });
    describe('where the entity has an empty value for owner in the spec', () => {
      it('returns false for hasGroupOwner', async () => {
        const facts = await entityFactRetriever.handler(handlerContext);
        expect(
          facts.find(it => it.entity.name === 'service-with-incomplete-data'),
        ).toMatchObject({
          facts: {
            hasGroupOwner: false,
          },
        });
      });
    });
  });
});
