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

import {
  EntityIteratorResult,
  IncrementalEntityProvider,
} from '@backstage/plugin-catalog-backend-module-incremental-ingestion';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
  EntityMeta,
  resourceEntityV1alpha1Validator,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { JsonObject } from '@backstage/types';
import { readAwsInfrastructureConfigs } from './config';
import {
  AwsConfigResource,
  AwsInfrastructureConfig,
  AwsInfrastructureConfigOptions,
  FieldTransformDefinition,
} from './types';
import {
  ConfigServiceClient,
  SelectAggregateResourceConfigCommand,
  SelectAggregateResourceConfigCommandOutput,
  SelectResourceConfigCommand,
  SelectResourceConfigCommandOutput,
} from '@aws-sdk/client-config-service';
import { SHA256 } from 'crypto-js';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { LoggerService } from '@backstage/backend-plugin-api';
import { merge } from 'lodash';
import jsonata from 'jsonata';

const AWS_SDK_CUSTOM_USER_AGENT = 'backstage-community-plugins';

interface Cursor {
  nextToken: string;
}

interface Context {}

export class AwsConfigInfrastructureProvider
  implements IncrementalEntityProvider<Cursor, Context>
{
  private readonly logger: LoggerService;
  private client: ConfigServiceClient;

  static async fromConfig(
    configRoot: Config,
    options: {
      logger: LoggerService;
    },
  ): Promise<
    {
      provider: AwsConfigInfrastructureProvider;
      options?: AwsInfrastructureConfigOptions;
    }[]
  > {
    const providerConfigs = readAwsInfrastructureConfigs(configRoot);

    const credsManager = DefaultAwsCredentialsManager.fromConfig(configRoot);

    return Promise.all(
      providerConfigs.map(async providerConfig => {
        let credentialProvider: AwsCredentialIdentityProvider;

        if (providerConfig.accountId) {
          credentialProvider = (
            await credsManager.getCredentialProvider({
              accountId: providerConfig.accountId,
            })
          ).sdkCredentialProvider;
        } else {
          credentialProvider = (await credsManager.getCredentialProvider())
            .sdkCredentialProvider;
        }

        return {
          provider: new AwsConfigInfrastructureProvider(
            providerConfig,
            credentialProvider,
            options.logger,
          ),
          options: providerConfig.options,
        };
      }),
    );
  }

  private constructor(
    private readonly config: AwsInfrastructureConfig,
    credentialProvider: AwsCredentialIdentityProvider,
    logger: LoggerService,
  ) {
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.client = new ConfigServiceClient({
      credentialDefaultProvider: () => credentialProvider,
      region: config.region,
      customUserAgent: AWS_SDK_CUSTOM_USER_AGENT,
    });
  }

  async next(
    _: Context,
    cursor?: Cursor | undefined,
  ): Promise<EntityIteratorResult<Cursor>> {
    this.logger.debug('Discovering AWS infrastructure resources');

    const query = this.createQuery();

    this.logger.debug(`Submitting AWS Config query: ${query}`);

    let entities: Entity[] = [];

    let response: SelectResourceConfigCommandOutput;

    // TODO: Aggregator option
    if (this.config.aggregator) {
      response = await this.client.send(
        new SelectAggregateResourceConfigCommand({
          Expression: query,
          ConfigurationAggregatorName: this.config.aggregator,
          Limit: this.config.options?.pageSize ?? 100,
          NextToken: cursor?.nextToken || undefined,
        }),
      );
    } else {
      response = await this.client.send(
        new SelectResourceConfigCommand({
          Expression: query,
          Limit: this.config.options?.pageSize ?? 100,
          NextToken: cursor?.nextToken || undefined,
        }),
      );
    }

    const parsed = this.parseResponse(response);

    entities = entities.concat(
      await Promise.all(
        parsed.map(result => {
          return this.resourceToEntity(result);
        }),
      ),
    );

    let nextToken = '';
    let done = true;

    if (response.NextToken) {
      done = false;
      nextToken = response.NextToken;
    }

    return {
      entities: entities.map(entity => ({
        entity,
      })),
      cursor: { nextToken },
      done,
    };
  }

  async around(burst: (context: Context) => Promise<void>): Promise<void> {
    await burst({});
  }

  getProviderName(): string {
    return `aws-config-provider:${this.config.id}`;
  }

  parseResponse(
    response: SelectAggregateResourceConfigCommandOutput,
  ): AwsConfigResource[] {
    return (
      response.Results?.map(result => {
        const resource: AwsConfigResource = JSON.parse(result);

        return resource;
      }) ?? []
    );
  }

  async resourceToEntity(resource: AwsConfigResource): Promise<Entity> {
    let resourceName: string;
    let resourceTitle: string | undefined;

    if (this.config.hashEntityNames) {
      resourceName = SHA256(resource.arn).toString().slice(0, 63);

      resourceTitle = resource.resourceName;
    } else {
      resourceName = resource.resourceName
        ? resource.resourceName.replace(':', '-')
        : SHA256(resource.arn).toString().slice(0, 63);
    }

    const resourceResult: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Resource',
      metadata: {
        annotations: {
          'aws.amazon.com/arn': resource.arn,
          'aws.amazon.com/resource-type': resource.resourceType,
          'aws.amazon.com/resource-id': resource.resourceId,
          'aws.amazon.com/name': resourceName,
          'aws.amazon.com/region': resource.awsRegion!,
        },
        name: resourceName,
        title: resourceTitle,
        description: `AWS Config Resource ${resource.resourceType} ${
          resource.resourceName || resource.resourceId
        }`,
      },
      spec: {
        type: this.resourceType(resource.resourceType),
        owner: 'unknown',
      },
    };

    const transformResult = await this.fieldsTransform(resource);

    const final = merge(resourceResult, transformResult);

    final.metadata.annotations![ANNOTATION_LOCATION] = this.getProviderName();
    final.metadata.annotations![ANNOTATION_ORIGIN_LOCATION] =
      this.getProviderName();

    try {
      const isValid = await resourceEntityV1alpha1Validator.check(final);

      if (!isValid) {
        throw new Error('Validate returned false');
      }
    } catch (e: any) {
      const error = `Invalid entity generated for ${resource.arn}`;
      this.logger.error(error, e);

      throw new Error(error);
    }

    return final;
  }

  resourceType(type: string): string {
    return type.split('::').slice(1).join('-').toLowerCase();
  }

  tagsToFilter(): string {
    if (!this.config.filters.tagFilters) {
      return '';
    }

    const clauses = this.config.filters.tagFilters.map(f => {
      if (f.value) {
        return `tags.tag = '${f.key}=${f.value}'`;
      }

      return `tags.key = '${f.key}'`;
    });

    return clauses.join(' AND ');
  }

  createQuery(): string {
    let whereClause = this.config.filters.resourceTypes
      .map(resourceType => {
        return `'${resourceType}'`;
      })
      .join(', ');

    whereClause = `resourceType IN (${whereClause})`;

    const tagFilterClause = this.tagsToFilter();

    if (tagFilterClause) {
      whereClause += ` AND ${tagFilterClause}`;
    }

    return `SELECT resourceId, resourceName, resourceType, awsRegion, accountId, arn, tags, configuration WHERE ${whereClause}`.trim();
  }

  async fieldsTransform(resource: AwsConfigResource): Promise<Partial<Entity>> {
    const metadata: Partial<EntityMeta> = {
      annotations: {},
    };

    const result: Partial<Entity> = {
      metadata: metadata as EntityMeta,
      spec: {},
    };

    const tagMap: any = {};

    resource.tags.forEach(e => {
      tagMap[e.key] = e.value;
    });

    const fields = this.config.transform?.fields;

    if (fields) {
      if (fields.spec) {
        const specConfig = fields.spec;

        const spec: JsonObject = {};

        if (specConfig.type) {
          spec.type = await this.fieldTransform(
            tagMap,
            specConfig.type,
            resource,
          );
        }

        if (specConfig.owner) {
          spec.owner = await this.fieldTransform(
            tagMap,
            specConfig.owner,
            resource,
          );
        }

        if (specConfig.system) {
          spec.system = await this.fieldTransform(
            tagMap,
            specConfig.system,
            resource,
          );
        }

        if (specConfig.component) {
          const component = await this.fieldTransform(
            tagMap,
            specConfig.component,
            resource,
          );

          if (component) {
            spec.dependencyOf = [`component:${component}`];
          }
        }

        result.spec = spec;
      }

      if (fields.name) {
        metadata.name = await this.fieldTransform(
          tagMap,
          fields.name,
          resource,
        );
      }

      if (fields.annotations) {
        for (const key of fields.annotations.keys()) {
          const field = fields.annotations.get(key)!;

          const value = await this.fieldTransform(tagMap, field, resource);

          if (value) {
            metadata.annotations![key] = value;
          }
        }
      }
    }

    return result;
  }

  async fieldTransform(
    tagMap: any,
    field: FieldTransformDefinition,
    resource: AwsConfigResource,
  ): Promise<string | undefined> {
    const { tag, value, expression } = field;

    if (tag) {
      return tagMap[tag];
    }

    if (value) {
      return value;
    }

    if (expression) {
      const jsonataExpression = jsonata(expression);
      jsonataExpression.assign('resource', resource);

      const result = await jsonataExpression.evaluate({});

      if (!result) {
        return undefined;
      }

      if (typeof result === 'string' || result instanceof String) {
        return result as string;
      }

      throw new Error('JSONata expression did not return string');
    }

    return undefined;
  }
}
