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
}

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
      {config: conf, logger: loggerMock},
      {schedule, scheduler}
    );
  }

  it('should be defined', () => {
    const threeScaleApiEntityProvider = createApiEntityProvider(
      schedulerTaskRunnerMock, shedulerServiceMock
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
        schedulerTaskRunnerMock, shedulerServiceMock
      )[0];
      await threeScaleApiEntityProvider.connect(entityProviderConnection);
    });

    it('should be created catalog entity with single api doc', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);
      const apiDocs = readTestJSONFile('single-api-docs');
      requestJsonDataMock.mockResolvedValueOnce(apiDocs);
      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'expectedOpenSingleAPISpecVersion3',
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
      const apiDocs = readTestJSONFile('single-api-docs-with-swagger-2.0');
      requestJsonDataMock.mockResolvedValueOnce(apiDocs);
      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'expectedNotConvertedSwagger2.0',
          'A simple API example',
        ),
      ];
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities,
      });
    });

    it('should be created catalog entity with single api doc but converted from swagger 1.2 to open API 3.0', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);
      const apiDocs = readTestJSONFile('single-api-docs-with-swagger-1.2');
      requestJsonDataMock.mockResolvedValueOnce(apiDocs);
      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'expectedOpenAPISingleSpecAfterSwagger1.2Conversion',
          'API for managing user profiles',
        ),
      ];
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities,
      });
    });

    it('should be created catalog entity with merged few api docs', async () => {
      const services = readTestJSONFile('services');
      requestJsonDataMock.mockResolvedValueOnce(services);
      const apiDocs = readTestJSONFile('multi-api-docs');
      requestJsonDataMock.mockResolvedValueOnce(apiDocs);
      const proxy = readTestJSONFile('proxy');
      requestJsonDataMock.mockResolvedValueOnce(proxy);

      await threeScaleApiEntityProvider.run();

      const entities = [
        createExpectedEntity(
          'expectedMergedOpenAPISpecWithVersion3',
          'A sample echo API',
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
        owner: '3scale',
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
