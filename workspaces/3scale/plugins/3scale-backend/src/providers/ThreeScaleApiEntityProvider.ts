import { LoggerService } from '@backstage/backend-plugin-api';
import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ApiEntity,
  Entity,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';

import {
  getProxyConfig,
  listApiDocs,
  listServices,
} from '../clients/ThreeScaleAPIConnector';
import {
  APIDocElement,
  APIDocs,
  Proxy,
  ServiceElement,
  Services,
} from '../clients/types';
import { readThreeScaleApiEntityConfigs } from './config';
import { ThreeScaleConfig } from './types';

export class ThreeScaleApiEntityProvider implements EntityProvider {
  private static SERVICES_FETCH_SIZE: number = 500;
  private readonly env: string;
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly logger: LoggerService;
  private readonly scheduleFn: () => Promise<void>;
  private connection?: EntityProviderConnection;

  static fromConfig(
    configRoot: Config,
    options: {
      logger: LoggerService;
      schedule?: TaskRunner;
      scheduler?: PluginTaskScheduler;
    },
  ): ThreeScaleApiEntityProvider[] {
    const providerConfigs = readThreeScaleApiEntityConfigs(configRoot);

    if (!options.schedule && !options.scheduler) {
      throw new Error('Either schedule or scheduler must be provided.');
    }

    return providerConfigs.map(providerConfig => {
      if (!options.schedule && !providerConfig.schedule) {
        throw new Error(
          `No schedule provided neither via code nor config for ThreeScaleApiEntityProvider:${providerConfig.id}.`,
        );
      }

      let taskRunner;

      if (options.scheduler && providerConfig.schedule) {
        // Create a scheduled task runner using the provided scheduler and schedule configuration
        taskRunner = options.scheduler.createScheduledTaskRunner(
          providerConfig.schedule,
        );
      } else if (options.schedule) {
        // Use the provided schedule directly
        taskRunner = options.schedule;
      } else {
        // Handle the case where both options.schedule and options.scheduler are missing
        throw new Error('Neither schedule nor scheduler is provided.');
      }

      return new ThreeScaleApiEntityProvider(
        providerConfig,
        options.logger,
        taskRunner,
      );
    });
  }

  private constructor(
    config: ThreeScaleConfig,
    logger: LoggerService,
    taskRunner: TaskRunner,
  ) {
    this.env = config.id;
    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.scheduleFn = this.createScheduleFn(taskRunner);
  }

  private createScheduleFn(taskRunner: TaskRunner): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:run`;
      return taskRunner.run({
        id: taskId,
        fn: async () => {
          try {
            await this.run();
          } catch (error: any) {
            // Ensure that we don't log any sensitive internal data:
            this.logger.error(
              `Error while syncing 3scale API from ${this.baseUrl}`,
              {
                // Default Error properties:
                name: error.name,
                message: error.message,
                stack: error.stack,
                // Additional status code if available:
                status: error.response?.status,
              },
            );
          }
        },
      });
    };
  }

  getProviderName(): string {
    return `ThreeScaleApiEntityProvider:${this.env}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.scheduleFn();
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(`Discovering ApiEntities from 3scale ${this.baseUrl}`);

    const entities: Entity[] = [];

    let page: number = 0;
    let services: Services;
    let apiDocs: APIDocs;
    let fetchServices: boolean = true;
    while (fetchServices) {
      services = await listServices(
        this.baseUrl,
        this.accessToken,
        page,
        ThreeScaleApiEntityProvider.SERVICES_FETCH_SIZE,
      );
      apiDocs = await listApiDocs(this.baseUrl, this.accessToken);
      for (const element of services.services) {
        const service = element;
        this.logger.debug(`Find service ${service.service.name}`);

        // Trying to find the API Doc for the service and validate if api doc was assigned to an API.
        const apiDoc = apiDocs.api_docs.find(obj => {
          if (obj.api_doc.service_id !== undefined) {
            return obj.api_doc.service_id === service.service.id;
          }
          return false;
        });

        const proxy = await getProxyConfig(
          this.baseUrl,
          this.accessToken,
          service.service.id,
        );
        if (apiDoc !== undefined) {
          this.logger.info(JSON.stringify(apiDoc));
          const apiEntity: ApiEntity = this.buildApiEntityFromService(
            service,
            apiDoc,
            proxy,
          );
          entities.push(apiEntity);
          this.logger.debug(`Discovered ApiEntity ${service.service.name}`);
        }
      }

      if (
        services.services.length <
        ThreeScaleApiEntityProvider.SERVICES_FETCH_SIZE
      ) {
        fetchServices = false;
      }
      page++;
    }

    this.logger.info(`Applying the mutation with ${entities.length} entities`);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }

  private buildApiEntityFromService(
    service: ServiceElement,
    apiDoc: APIDocElement,
    proxy: Proxy,
  ): ApiEntity {
    const location = `url:${this.baseUrl}/apiconfig/services/${service.service.id}`;

    const spec = JSON.parse(apiDoc.api_doc.body);

    return {
      kind: 'API',
      apiVersion: 'backstage.io/v1alpha1',
      metadata: {
        annotations: {
          [ANNOTATION_LOCATION]: location,
          [ANNOTATION_ORIGIN_LOCATION]: location,
        },
        //  TODO: add tenant name
        name: `${service.service.system_name}`,
        description:
          spec.info.description || `Version: ${service.service.description}`,
        //  TODO: add labels
        //  labels: this.getApiEntityLabels(service),
        links: [
          {
            url: `${this.baseUrl}/apiconfig/services/${service.service.id}`,
            title: '3scale Overview',
          },
          {
            url: `${proxy.proxy.sandbox_endpoint}`,
            title: 'Staging Apicast Endpoint',
          },
          {
            url: `${proxy.proxy.endpoint}`,
            title: 'Production Apicast Endpoint',
          },
        ],
      },
      spec: {
        type: 'openapi',
        lifecycle: this.env,
        system: '3scale',
        owner: '3scale',
        definition: apiDoc.api_doc.body,
      },
    };
  }
}
