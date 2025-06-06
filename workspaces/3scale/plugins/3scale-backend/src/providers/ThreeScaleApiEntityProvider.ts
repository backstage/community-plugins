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

import type {
  SchedulerServiceTaskRunner,
  SchedulerService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ApiEntity,
  Entity,
} from '@backstage/catalog-model';

import type { Config } from '@backstage/config';
import { InputError, isError, NotFoundError } from '@backstage/errors';

import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';

import { getProxyConfig, listApiDocs, listServices } from '../clients';
import type {
  APIDocElement,
  APIDocs,
  Proxy,
  ServiceElement,
  Services,
} from '../clients/types';
import { readThreeScaleApiEntityConfigs } from './config';
import { isNonEmptyArray, NonEmptyArray, ThreeScaleConfig } from './types';
import {
  isOpenAPI3_0,
  isSwagger1_2,
  isSwagger2_0,
  OpenAPIMergerAndConverter,
} from './open-api-merger-converter';
import { Swagger } from 'atlassian-openapi';

/**
 * @public
 */
export class ThreeScaleApiEntityProvider implements EntityProvider {
  private static SERVICES_FETCH_SIZE: number = 500;
  private readonly env: string;
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly ownerLabel: string;
  private readonly systemLabel: string;
  private readonly logger: LoggerService;
  private readonly scheduleFn: () => Promise<void>;
  private readonly openApiMerger: OpenAPIMergerAndConverter;
  private connection?: EntityProviderConnection;

  static fromConfig(
    deps: {
      config: Config;
      logger: LoggerService;
    },
    options: {
      schedule: SchedulerServiceTaskRunner;
      scheduler: SchedulerService;
    },
  ): ThreeScaleApiEntityProvider[] {
    const providerConfigs = readThreeScaleApiEntityConfigs(deps.config);

    if (!options.schedule && !options.scheduler) {
      throw new Error('Either schedule or scheduler must be provided.');
    }

    return providerConfigs.map(providerConfig => {
      if (!options.schedule && !providerConfig.schedule) {
        throw new InputError(
          `No schedule provided via config for ThreeScaleApiEntityProvider:${providerConfig.id}.`,
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
        deps.logger,
        taskRunner,
      );
    });
  }

  private constructor(
    config: ThreeScaleConfig,
    logger: LoggerService,
    taskRunner: SchedulerServiceTaskRunner,
  ) {
    this.env = config.id;
    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;
    this.ownerLabel = config.ownerLabel || '3scale';
    this.systemLabel = config.systemLabel || '3scale';
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.scheduleFn = this.createScheduleFn(taskRunner);
    this.openApiMerger = new OpenAPIMergerAndConverter();
  }

  private createScheduleFn(
    taskRunner: SchedulerServiceTaskRunner,
  ): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:run`;
      return taskRunner.run({
        id: taskId,
        fn: async () => {
          try {
            await this.run();
          } catch (error: any) {
            if (isError(error)) {
              // Ensure that we don't log any sensitive internal data:
              this.logger.error(
                `Error while syncing 3scale API from ${this.baseUrl}`,
                {
                  // Default Error properties:
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                  // Additional status code if available:
                  status: (error.response as { status?: string })?.status,
                },
              );
            }
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
      throw new NotFoundError('Not initialized');
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
        try {
          const service = element;
          this.logger.debug(`Find service ${service.service.name}`);

          const docs = apiDocs.api_docs.filter(
            obj => obj.api_doc.service_id === service.service.id,
          );
          const proxy = await getProxyConfig(
            this.baseUrl,
            this.accessToken,
            service.service.id,
          );
          if (isNonEmptyArray(docs)) {
            this.logger.info(JSON.stringify(docs));
            const apiEntity: ApiEntity = await this.buildApiEntityFromService(
              service,
              docs,
              proxy,
            );
            entities.push(apiEntity);
            this.logger.debug(`Discovered ApiEntity ${service.service.name}`);
          }
        } catch (error: any) {
          if (isError(error)) {
            // Ensure that we don't log any sensitive internal data:
            this.logger.error(
              `Error while building API entity from ${element.service.id}: ${element.service.name}`,
              {
                // Default Error properties:
                name: error.name,
                message: error.message,
                stack: error.stack,
                // Additional status code if available:
                status: (error.response as { status?: string })?.status,
              },
            );
          }
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

  private async buildApiEntityFromService(
    service: ServiceElement,
    apiDocs: NonEmptyArray<APIDocElement>,
    proxy: Proxy,
  ): Promise<ApiEntity> {
    const location = `url:${this.baseUrl}/apiconfig/services/${service.service.id}`;
    const serviceDescription = service.service.description || '';
    let entityDescription: string | undefined;

    const docs = apiDocs.map(doc => JSON.parse(doc.api_doc.body));

    let swaggerDocJSON;
    if (docs.length > 1) {
      // convert all docs to openapi 3.0 and merge them
      let mergedDescription = `[Merged ${docs.length} API docs]`;
      let mergedTitle = mergedDescription;
      const convertedDocs: Swagger.SwaggerV3[] = [];
      for (const doc of docs) {
        const convertedDoc = await this.openApiMerger.convertAPIDocToOpenAPI3(
          doc,
        );
        convertedDocs.push(convertedDoc);
        mergedDescription = getDocInfo(convertedDoc)?.description
          ? `${mergedDescription} ${getDocInfo(convertedDoc)?.description}`
          : mergedDescription;
        mergedTitle = getDocInfo(convertedDoc)?.title
          ? `${mergedTitle} ${getDocInfo(convertedDoc)?.title}`
          : mergedTitle;
      }
      if (isNonEmptyArray(convertedDocs)) {
        swaggerDocJSON = await this.openApiMerger.mergeOpenAPI3Docs(
          convertedDocs,
        );
        swaggerDocJSON.info.description = mergedDescription;
        swaggerDocJSON.info.title = mergedTitle;
        entityDescription = mergedDescription;
      }
    }

    if (docs.length === 1) {
      swaggerDocJSON = docs[0];

      const spec = JSON.parse(apiDocs[0].api_doc.body);
      if (isSwagger1_2(spec)) {
        // Backstage UI can render only openapi 3.0 or swagger 2.0. That's why we need to convert swagger 1.2 to swagger 2.0.
        swaggerDocJSON = await this.openApiMerger.convertSwagger1_2To2_0(spec);
      }
      entityDescription = getDocInfo(spec)?.description;
    }

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
        description: entityDescription || serviceDescription,
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
        system: this.systemLabel,
        owner: this.ownerLabel,
        definition: JSON.stringify(swaggerDocJSON, null, 2),
      },
    };
  }
}

function getDocInfo(
  spec: any,
): { description: string; title: string } | undefined {
  if (isSwagger2_0(spec) || isOpenAPI3_0(spec)) {
    return spec.info;
  }

  // swagger 1.2 spec doc defined by single file doesn't have description field
  return undefined;
}
