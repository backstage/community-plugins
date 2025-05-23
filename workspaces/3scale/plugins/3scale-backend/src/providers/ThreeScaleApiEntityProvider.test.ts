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
import { ThreeScaleApiEntityProvider } from './ThreeScaleApiEntityProvider';
import { ConfigReader } from '@backstage/config';
import {
  SchedulerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { resolve } from 'path';
import fs from 'fs';

const requestJsonDataMock = jest.fn().mockResolvedValue([]);

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(requestJsonDataMock()),
    headers: new Headers(),
    text: () => Promise.resolve('mocked text data'),
  } as Response),
);

const loggerMock = mockServices.logger.mock();

const schedulerTaskRunnerMock = {
  run: jest.fn().mockImplementation(),
};

const shedulerServiceMock = {
  triggerTask: jest.fn().mockImplementation(),
  scheduleTask: jest.fn().mockImplementation(),
  createScheduledTaskRunner: jest.fn().mockImplementation(),
  getScheduledTasks: jest.fn().mockImplementation(),
};

const entityProviderConnection = {
  applyMutation: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

describe('ThreeScaleApiEntityProvider', () => {
  let conf: ConfigReader;

  beforeEach(() => {
    conf = new ConfigReader({
      catalog: {
        providers: {
          threeScaleApiEntity: {
            test: {
              baseUrl: 'test',
              accessToken: 'test',
              ownerLabel: 'test',
            },
          },
        },
      },
    });
  });

  function createApiEntityProvider(
    schedule: SchedulerServiceTaskRunner,
    scheduler: SchedulerService,
  ): ThreeScaleApiEntityProvider[] {
    return ThreeScaleApiEntityProvider.fromConfig(
      { config: conf, logger: loggerMock },
      { schedule, scheduler },
    );
  }

  it('should be defined', () => {
    const threeScaleApiEntityProvider = createApiEntityProvider(
      schedulerTaskRunnerMock,
      shedulerServiceMock,
    );
    expect(threeScaleApiEntityProvider).toBeDefined();
    expect(threeScaleApiEntityProvider).toBeInstanceOf(Array);
    expect(threeScaleApiEntityProvider.length).toBe(1);
  });

  describe('run', () => {
    let threeScaleApiEntityProvider: ThreeScaleApiEntityProvider;
    beforeEach(async () => {
      entityProviderConnection.applyMutation.mockClear();
      threeScaleApiEntityProvider = createApiEntityProvider(
        schedulerTaskRunnerMock,
        shedulerServiceMock,
      )[0];
      await threeScaleApiEntityProvider.connect(entityProviderConnection);
    });

    it('should be created catalog entity with single open API 3.0 doc', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);

      const openAPI3_0Spec = readTestJSONFile('input/open-api-3.0-doc');
      const apiDoc = createAPIDoc(
        'ping',
        'ping',
        'A simple API that responds with the input message.',
        openAPI3_0Spec,
      );
      const apiDocs = { api_docs: [apiDoc] };
      requestJsonDataMock.mockResolvedValueOnce(apiDocs);

      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'input/open-api-3.0-doc',
          'A simple API that responds with the input message.',
        ),
      ];
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities,
      });
    });

    it('should be created catalog entity with single api doc but swagger 2.0 should not be converted to API 3.0', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);

      const swagger2_0Spec = readTestJSONFile('input/swagger-2.0-doc');
      const apiDoc = createAPIDoc(
        'list-users',
        'List users API',
        'List users API.',
        swagger2_0Spec,
      );
      const apiDocs = { api_docs: [apiDoc] };
      requestJsonDataMock.mockResolvedValueOnce(apiDocs);

      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity('input/swagger-2.0-doc', 'List users API.'),
      ];
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities,
      });
    });

    it('should be created catalog entity with single api doc but converted from swagger 1.2 to swagger 2.0', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);
      const swagger1_2Spec = readTestJSONFile('input/swagger-1.2-doc');
      const apiDoc = createAPIDoc(
        'get-user-profile-by-id',
        'Get User Profile By ID',
        'User profile API.',
        swagger1_2Spec,
      );
      const apiDocs = { api_docs: [apiDoc] };
      requestJsonDataMock.mockResolvedValueOnce(apiDocs);
      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'output/swagger-1.2-converted-to-swagger-2.0',
          'Nice API',
        ),
      ];
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities,
      });
    });

    it('should be created catalog entity with merged 2 open API 3.0 docs', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);

      const openAPI3_0Spec1 = readTestJSONFile('input/open-api-3.0-doc');
      const apiDoc1 = createAPIDoc(
        'ping',
        'Ping',
        'A simple API that responds with the input message.',
        openAPI3_0Spec1,
      );
      const openAPI3_0Spec2 = readTestJSONFile('input/open-api-3.0-doc-2');
      const apiDoc2 = createAPIDoc(
        'echo',
        'Echo',
        'A sample echo API.',
        openAPI3_0Spec2,
      );

      const apiDocs = { api_docs: [apiDoc1, apiDoc2] };

      requestJsonDataMock.mockResolvedValueOnce(apiDocs);

      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'output/merged-2-open-api-3.0-docs',
          '[Merged 2 API docs] A simple API that responds with the input message. A sample echo API.',
        ),
      ];
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities,
      });
    });

    it('should be created catalog entity with merged 3 api docs in different formats', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);

      const openAPI3_0Spec1 = readTestJSONFile('input/open-api-3.0-doc');
      const apiDoc1 = createAPIDoc(
        'ping',
        'ping',
        'A simple API that responds with the input message.',
        openAPI3_0Spec1,
      );
      const swagger2_0Spec = readTestJSONFile('input/swagger-2.0-doc');
      const apiDoc2 = createAPIDoc(
        'list-users',
        'List users API',
        'List users API.',
        swagger2_0Spec,
      );
      const swagger1_2Spec = readTestJSONFile('input/swagger-1.2-doc');
      const apiDoc3 = createAPIDoc(
        'get-user-profile-by-id',
        'Get User Profile By ID',
        'User profile API.',
        swagger1_2Spec,
      );

      const apiDocs = { api_docs: [apiDoc1, apiDoc2, apiDoc3] };

      requestJsonDataMock.mockResolvedValueOnce(apiDocs);

      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'output/merged-3-different-api-docs',
          '[Merged 3 API docs] A simple API that responds with the input message. List users API.',
        ),
      ];
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities,
      });
    });
  });
});

function readTestJSONFile(fileName: string): any {
  const file = resolve(__dirname, `./../__fixtures__/data/${fileName}.json`);
  const fileContent = fs.readFileSync(file, 'utf8');
  return JSON.parse(fileContent);
}

function createExpectedEntity(
  fileWithExpectedOpenAPISpec: string,
  description: string,
): any {
  return {
    entity: {
      kind: 'API',
      apiVersion: 'backstage.io/v1alpha1',
      metadata: {
        annotations: {
          'backstage.io/managed-by-location': 'url:test/apiconfig/services/2',
          'backstage.io/managed-by-origin-location':
            'url:test/apiconfig/services/2',
        },
        name: 'api',
        description,
        links: [
          {
            url: 'test/apiconfig/services/2',
            title: '3scale Overview',
          },
          {
            url: 'https://api-3scale-apicast-staging.apps.rosa.ceazq-ocd3j-vy9.8aja.p3.openshiftapps.com:443',
            title: 'Staging Apicast Endpoint',
          },
          {
            url: 'https://api-3scale-apicast-production.apps.rosa.ceazq-ocd3j-vy9.8aja.p3.openshiftapps.com:443',
            title: 'Production Apicast Endpoint',
          },
        ],
      },
      spec: {
        type: 'openapi',
        lifecycle: 'test',
        system: '3scale',
        owner: 'test',
        definition: JSON.stringify(
          readTestJSONFile(fileWithExpectedOpenAPISpec),
          null,
          2,
        ),
      },
    },
    locationKey: 'ThreeScaleApiEntityProvider:test',
  };
}

function createAPIDoc(
  systemName: string,
  name: string,
  description: string,
  apiDocBody: any,
) {
  return {
    api_doc: {
      id: 1,
      system_name: systemName,
      name: name,
      description: description,
      published: true,
      skip_swagger_validations: false,
      body: JSON.stringify(apiDocBody),
      service_id: 2,
      created_at: '2024-09-17T10:09:04Z',
      updated_at: '2024-09-17T10:09:04Z',
    },
  };
}
