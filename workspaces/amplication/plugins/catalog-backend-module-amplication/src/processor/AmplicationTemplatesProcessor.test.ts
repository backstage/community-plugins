/*
 * Copyright 2023 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { AmplicationTemplatesProcessor } from './AmplicationTemplatesProcessor';
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { CatalogProcessorCache } from '@backstage/plugin-catalog-node/index';
import { processingResult } from '@backstage/plugin-catalog-node';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

describe('AmplicationTemplatesProcessor Name', () => {
  it('runs successfully', async () => {
    const processor = buildProcessor();

    expect(processor.getProcessorName()).toBe('AmplicationTemplatesProcessor');
  });
});

describe('Calling the API', () => {
  const handlers = [
    http.post('https://amplication.com/templates', () => {
      return HttpResponse.json({
        data: {
          catalog: {
            totalCount: 2,
            data: [
              {
                id: 'cm6gs6t6v000fjx5te4xlrcfx',
                name: 'Resource Itai-template',
                description: 'Template created from an existing resource',
                resourceType: 'ServiceTemplate',
                project: {
                  id: 'cm6gb3j0a000q14gzlq9m7h1o',
                  name: 'Sample Project',
                },
                blueprint: {
                  id: 'cm6grdfol000bjx5t7gixjk0q',
                  name: "Itai's Blueprint",
                },
              },
              {
                id: 'cm6sbna88000xutjte7zu96ee',
                name: 'pick-me-template',
                description: 'Template created from an existing resource',
                resourceType: 'ServiceTemplate',
                project: {
                  id: 'cm6hv1ugf005hjx5tr087j8d3',
                  name: 'ma-yesh-beze',
                },
                blueprint: {
                  id: 'cm6gb3j00000p14gz2n11otq4',
                  name: "Node.js Service (Amplication's Standard)",
                },
              },
            ],
          },
        },
      });
    }),
  ];

  const server = setupServer(...handlers);

  server.listen();

  it('returns false if location is not a graphql', async () => {
    const processor = buildProcessor();

    const location: LocationSpec = {
      type: 'url',
      target: 'https://amplication.com/templates',
    };
    const emit = jest.fn();
    const parser = jest.fn();
    const cache: CatalogProcessorCache = {
      get: jest.fn(),
      set: jest.fn(),
    };
    const result = await processor.readLocation(
      location,
      true,
      emit,
      parser,
      cache,
    );

    expect(result).toBe(false);
  });

  it('returns true if location is a graphql', async () => {
    const processor = buildProcessor();

    const location: LocationSpec = {
      type: 'graphql',
      target: 'https://amplication.com/templates',
    };
    const emit = jest.fn();
    const parser = jest.fn();
    const cache: CatalogProcessorCache = {
      get: jest.fn(),
      set: jest.fn(),
    };
    const result = await processor.readLocation(
      location,
      true,
      emit,
      parser,
      cache,
    );

    expect(result).toBe(true);
  });

  it('emit() is called with the correct arguments', async () => {
    const processor = buildProcessor();

    const location: LocationSpec = {
      type: 'graphql',
      target: 'https://amplication.com/templates',
    };
    const emit = jest.fn();
    const parser = jest.fn();
    const cache: CatalogProcessorCache = {
      get: jest.fn(),
      set: jest.fn(),
    };
    const result = await processor.readLocation(
      location,
      true,
      emit,
      parser,
      cache,
    );

    const api: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'amplication-bot',
        description: 'Amplication Bot',
        tags: ['amplication'],
      },
      spec: {
        profile: {
          displayName: 'Amplication Bot',
          email: 'support@amplication.com',
        },
        memberOf: ['guests'],
      },
    };

    const system: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: {
        name: 'Amplication',
        tags: ['amplication'],
        description:
          'Amplication is a platform for building full-stack applications with code generation.',
      },
      spec: {
        owner: 'user:amplication-bot',
      },
    };

    const user: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'amplication-bot',
        description: 'Amplication Bot',
        tags: ['amplication'],
      },
      spec: {
        profile: {
          displayName: 'Amplication Bot',
          email: 'support@amplication.com',
        },
        memberOf: ['guests'],
      },
    };

    const item: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'resource-itai-template',
        title: 'Resource Itai-template',
        description: 'Template created from an existing resource',
        tags: ['amplication', 'servicetemplate'],
      },
      spec: {
        id: 'cm6gs6t6v000fjx5te4xlrcfx',
        type: 'ServiceTemplate',
        project: 'Sample Project',
        project_id: 'cm6gb3j0a000q14gzlq9m7h1o',
        blueprint: "Itai's Blueprint",
        blueprint_id: 'cm6grdfol000bjx5t7gixjk0q',
        lifecycle: 'production',
        providesApis: ['amplication-api'],
        system: 'amplication',
        owner: 'user:amplication-bot',
      },
    };

    expect(result).toBe(true);
    expect(cache.get).toHaveBeenCalled();
    expect(emit).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledTimes(5);
    expect(emit).toHaveBeenCalledWith(processingResult.entity(location, user));
    expect(emit).toHaveBeenCalledWith(
      processingResult.entity(location, system),
    );
    expect(emit).toHaveBeenCalledWith(processingResult.entity(location, api));
    expect(emit).toHaveBeenCalledWith(processingResult.entity(location, item));
  });
});

function buildProcessor() {
  const logger: LoggerService = mockServices.logger.mock();
  const config: RootConfigService = mockServices.rootConfig.mock();
  return new AmplicationTemplatesProcessor(logger, config);
}
