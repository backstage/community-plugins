/*
 * Copyright 2022 The Backstage Authors
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

import { buildTechInsightsContext } from './techInsightsContextBuilder';
import { ConfigReader } from '@backstage/config';
import { DefaultSchedulerService } from '@backstage/backend-defaults/scheduler';
import { DefaultFactRetrieverRegistry } from './fact/FactRetrieverRegistry';
import { Knex } from 'knex';
import { mockServices } from '@backstage/backend-test-utils';
import { DatabaseService } from '@backstage/backend-plugin-api';

jest.mock('./fact/FactRetrieverRegistry');
jest.mock('./fact/FactRetrieverEngine', () => ({
  DefaultFactRetrieverEngine: {
    create: jest.fn().mockResolvedValue({
      schedule: jest.fn(),
    }),
  },
}));

describe('buildTechInsightsContext', () => {
  const logger = mockServices.logger.mock();
  const urlReader = mockServices.urlReader.mock();
  const database: DatabaseService = {
    getClient: () => {
      return Promise.resolve({
        migrate: {
          latest: () => {},
        },
      }) as unknown as Promise<Knex>;
    },
  };
  const discoveryMock = {
    getBaseUrl: (_: string) => Promise.resolve('http://mock.url'),
    getExternalBaseUrl: (_: string) => Promise.resolve('http://mock.url'),
  };
  const rootLifecycle = mockServices.rootLifecycle.mock();
  const httpRouter = mockServices.httpRouter.mock();
  const scheduler = DefaultSchedulerService.create({
    database,
    logger,
    rootLifecycle,
    httpRouter,
    pluginMetadata: { getId: () => 'plugin-id' },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs the default FactRetrieverRegistry if factRetrievers but no factRetrieverRegistry are passed', () => {
    buildTechInsightsContext({
      database,
      logger,
      factRetrievers: [],
      scheduler,
      config: ConfigReader.fromConfigs([]),
      discovery: discoveryMock,
      auth: mockServices.auth(),
      urlReader,
    });
    expect(DefaultFactRetrieverRegistry).toHaveBeenCalledTimes(1);
  });

  it('uses factRetrieverRegistry implementation instead of the default FactRetrieverRegistry if it is passed in', () => {
    const factRetrieverRegistryMock = {} as DefaultFactRetrieverRegistry;

    buildTechInsightsContext({
      database,
      logger,
      factRetrievers: [],
      factRetrieverRegistry: factRetrieverRegistryMock,
      scheduler,
      config: ConfigReader.fromConfigs([]),
      discovery: discoveryMock,
      auth: mockServices.auth(),
      urlReader,
    });
    expect(DefaultFactRetrieverRegistry).not.toHaveBeenCalled();
  });
});
