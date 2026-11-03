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

import { ConfigReader } from '@backstage/config';
import { AwsConfigInfrastructureProvider } from './AwsConfigInfrastructureProvider';
import { mockClient } from './mocks/awsClientMock';
import {
  ConfigServiceClient,
  SelectResourceConfigCommand,
  SelectAggregateResourceConfigCommand,
} from '@aws-sdk/client-config-service';
import { mockServices } from '@backstage/backend-test-utils';
import { mockResource } from './mocks';
import { AwsConfigResource } from './types';

const logger = mockServices.logger.mock();

describe('AwsConfigInfrastructureProvider', () => {
  const mock = mockClient(ConfigServiceClient);

  beforeEach(() => {
    mock.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = undefined;
  });

  const expectMutation = async (
    providerId: string,
    providerConfig: object,
    expectedEntities: any[],
    expectedQuery?: string,
  ) => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          awsConfig: {
            [providerId]: providerConfig,
          },
        },
      },
    });

    const { provider } = (
      await AwsConfigInfrastructureProvider.fromConfig(config, {
        logger,
      })
    )[0];
    expect(provider.getProviderName()).toEqual(
      `aws-config-provider:${providerId}`,
    );

    const result = await provider.next({}, undefined);

    expect(result.entities).toEqual(expectedEntities);

    if (expectedQuery) {
      expect(mock).toHaveReceivedCommandWith(SelectResourceConfigCommand, {
        Expression: expectedQuery,
      });
    }
  };

  describe.each([false, true])('exclusions (aggregated: %s)', aggregated => {
    const command = aggregated
      ? SelectAggregateResourceConfigCommand
      : SelectResourceConfigCommand;
    const nameKey = 'Name';
    const excludeTags = [
      { key: nameKey, valuePattern: 'temporary-\\d+' },
      { key: 'Ephemeral', value: 'true' },
      { key: 'Temporary' },
      { key: 'Unassigned', value: '' },
    ];
    const createProvider = async (exclusions?: object[]) => {
      const [{ provider }] = await AwsConfigInfrastructureProvider.fromConfig(
        new ConfigReader({
          catalog: {
            providers: {
              awsConfig: {
                default: {
                  ...(aggregated ? { aggregator: 'organization' } : {}),
                  filters: {
                    resourceTypes: ['AWS::DynamoDB::Table'],
                    tags: [{ key: 'environment', value: 'prod' }],
                    ...(exclusions ? { excludeTags: exclusions } : {}),
                  },
                },
              },
            },
          },
        }),
        { logger },
      );
      return provider;
    };
    const resource = (name: string, tags?: Record<string, string>) => {
      const result: AwsConfigResource = mockResource(
        name,
        '111',
        'us-west-2',
        'AWS::DynamoDB::Table',
        {},
        tags ?? {},
      );
      if (tags === undefined) {
        delete result.tags;
      }
      return result;
    };

    it('matches exclusions locally before transformation and preserves the query', async () => {
      const resources = [
        resource('pattern-match', { [nameKey]: 'resource-temporary-123' }),
        resource('pattern-with-suffix', {
          [nameKey]: 'resource-temporary-123-dev',
        }),
        resource('ephemeral', { Ephemeral: 'true' }),
        resource('temporary', { Temporary: 'anything' }),
        resource('temporary-empty', { Temporary: '' }),
        resource('empty-value', { Unassigned: '' }),
        resource('persistent', { [nameKey]: 'resource-production' }),
        resource('non-numeric-suffix', {
          [nameKey]: 'resource-temporary-example',
        }),
        resource('missing-tags'),
        resource('empty-tags', {}),
        resource('unrelated-key', { other: 'resource-temporary-123' }),
        resource('different-value', { Ephemeral: 'false', Unassigned: 'team' }),
        resource('case-sensitive', {
          Ephemeral: 'TRUE',
          [nameKey]: 'resource-TEMPORARY-123',
        }),
        resource('exact-value', { Ephemeral: 'true-extra' }),
        resource('any-tag', { other: 'keep', Ephemeral: 'true' }),
      ];
      mock.on(command).callsFake(async () => ({
        Results: resources.map(r => JSON.stringify(r)),
      }));

      const unfiltered = await createProvider();
      expect((await unfiltered.next({})).entities).toHaveLength(
        resources.length,
      );
      const provider = await createProvider(excludeTags);
      const transform = jest.spyOn(provider, 'resourceToEntity');
      const result = await provider.next({});
      const retained = resources.slice(6, -1);
      expect(result.entities?.map(e => e.entity.metadata.name)).toEqual(
        retained.map(r => r.resourceName),
      );
      expect(transform.mock.calls.map(([r]) => r.resourceName)).toEqual(
        retained.map(r => r.resourceName),
      );
      expect(result.done).toBe(true);
      expect(mock).toHaveReceivedCommandWith(command, {
        Expression:
          "SELECT resourceId, resourceName, resourceType, awsRegion, accountId, arn, tags, configuration WHERE resourceType IN ('AWS::DynamoDB::Table') AND tags.tag = 'environment=prod'",
        ...(aggregated ? { ConfigurationAggregatorName: 'organization' } : {}),
      });
    });

    it('continues pagination through a fully excluded page', async () => {
      mock.on(command).callsFake(async input =>
        input.NextToken
          ? {
              Results: [
                JSON.stringify(resource('retained', { Ephemeral: 'false' })),
              ],
            }
          : {
              Results: [
                JSON.stringify(resource('excluded', { Ephemeral: 'true' })),
              ],
              NextToken: 'page-two',
            },
      );
      const provider = await createProvider(excludeTags);
      const transform = jest.spyOn(provider, 'resourceToEntity');
      const first = await provider.next({});
      expect(first).toEqual({
        entities: [],
        cursor: { nextToken: 'page-two' },
        done: false,
      });
      expect(transform).not.toHaveBeenCalled();
      const second = await provider.next({}, first.cursor);
      expect(second.entities?.map(e => e.entity.metadata.name)).toEqual([
        'retained',
      ]);
      expect(second.done).toBe(true);
      expect(mock).toHaveReceivedCommandWith(command, {
        NextToken: 'page-two',
      });
    });
  });

  it.each([
    [
      { key: 'Ephemeral', value: '', valuePattern: '' },
      'specify only one of value and valuePattern',
    ],
    [{ key: 'stack', valuePattern: '[' }, 'invalid valuePattern'],
  ])(
    'rejects invalid exclusions during initialization: %j',
    async (entry, message) => {
      await expect(
        AwsConfigInfrastructureProvider.fromConfig(
          new ConfigReader({
            catalog: {
              providers: {
                awsConfig: {
                  broken: {
                    filters: {
                      resourceTypes: ['AWS::DynamoDB::Table'],
                      excludeTags: [{ key: 'valid' }, entry],
                    },
                  },
                },
              },
            },
          }),
          { logger },
        ),
      ).rejects.toThrow(
        `catalog.providers.awsConfig.broken.filters.excludeTags[1]: ${message}`,
      );
      expect(mock).not.toHaveReceivedCommandWith(
        SelectResourceConfigCommand,
        {},
      );
      expect(mock).not.toHaveReceivedCommandWith(
        SelectAggregateResourceConfigCommand,
        {},
      );
    },
  );

  // eslint-disable-next-line jest/expect-expect
  it('should apply mutation', async () => {
    mock.on(SelectResourceConfigCommand).callsFake(async _ => {
      return {
        Results: [
          JSON.stringify(
            mockResource(
              'test1',
              '111',
              'us-west-2',
              'AWS::ECS::Service',
              { PlatformVersion: 'LATEST' },
              { component: 'app1', owner: 'team1', system: 'system1' },
            ),
          ),
          JSON.stringify(
            mockResource(
              'test2',
              '222',
              'us-west-2',
              'AWS::ECS::Service',
              { PlatformVersion: 'LATEST' },
              { component: 'app2', owner: 'team2', system: 'system2' },
            ),
          ),
        ],
      };
    });

    return expectMutation(
      'default',
      {
        filters: { resourceTypes: ['AWS::ECS::Cluster'] },
      },
      [
        createResource({
          name: 'test1',
          accountId: '111',
          region: 'us-west-2',
          resourceType: 'AWS::ECS::Service',
          providerId: 'default',
          type: 'ecs-service',
        }),
        createResource({
          name: 'test2',
          accountId: '222',
          region: 'us-west-2',
          resourceType: 'AWS::ECS::Service',
          providerId: 'default',
          type: 'ecs-service',
        }),
      ],
      `SELECT resourceId, resourceName, resourceType, awsRegion, accountId, arn, tags, configuration WHERE resourceType IN ('AWS::ECS::Cluster')`,
    );
  });

  // eslint-disable-next-line jest/expect-expect
  it('should handle empty resources', async () => {
    mock.on(SelectResourceConfigCommand).callsFake(async _ => {
      return {
        Results: [],
      };
    });

    return expectMutation(
      'default',
      {
        filters: { resourceTypes: ['AWS::ECS::Cluster'] },
      },
      [],
      `SELECT resourceId, resourceName, resourceType, awsRegion, accountId, arn, tags, configuration WHERE resourceType IN ('AWS::ECS::Cluster')`,
    );
  });

  // eslint-disable-next-line jest/expect-expect
  it('should apply mutation with tag filters', async () => {
    mock.on(SelectResourceConfigCommand).callsFake(async _ => {
      return {
        Results: [
          JSON.stringify(
            mockResource(
              'test1',
              '111',
              'us-west-2',
              'AWS::ECS::Service',
              { PlatformVersion: 'LATEST' },
              { component: 'app1', owner: 'team1', system: 'system1' },
            ),
          ),
        ],
      };
    });

    return expectMutation(
      'default',
      {
        filters: {
          tags: [{ key: 'component' }, { key: 'environment', value: 'prod' }],
          resourceTypes: ['AWS::ECS::Cluster'],
        },
      },
      [
        createResource({
          name: 'test1',
          accountId: '111',
          region: 'us-west-2',
          resourceType: 'AWS::ECS::Service',
          providerId: 'default',
          type: 'ecs-service',
        }),
      ],
      `SELECT resourceId, resourceName, resourceType, awsRegion, accountId, arn, tags, configuration WHERE resourceType IN ('AWS::ECS::Cluster') AND tags.key = 'component' AND tags.tag = 'environment=prod'`,
    );
  });

  // eslint-disable-next-line jest/expect-expect
  it('should apply mutation with field transforms', async () => {
    mock.on(SelectResourceConfigCommand).callsFake(async _ => {
      return {
        Results: [
          JSON.stringify(
            mockResource(
              'test1',
              '111',
              'us-west-2',
              'AWS::ECS::Service',
              { PlatformVersion: 'LATEST' },
              { component: 'app1', owner: 'team1', system: 'system1' },
            ),
          ),
          JSON.stringify(
            mockResource(
              'test2',
              '222',
              'us-west-2',
              'AWS::ECS::Service',
              { PlatformVersion: 'LATEST' },
              { none: 'missing' },
            ),
          ),
        ],
      };
    });

    return expectMutation(
      'default',
      {
        filters: { resourceTypes: ['AWS::ECS::Service'] },
        transform: {
          fields: {
            name: {
              expression:
                "$join([$resource.resourceName, $resource.accountId], '-')",
            },
            annotations: {
              'aws.amazon.com/account-id': {
                expression: '$resource.accountId',
              },
            },
            spec: {
              owner: { tag: 'owner' },
              system: { value: 'some-system' },
              component: { tag: 'component' },
              type: { value: 'ecs-service-custom' },
            },
          },
        },
      },
      [
        createResource({
          name: 'test1',
          accountId: '111',
          region: 'us-west-2',
          resourceType: 'AWS::ECS::Service',
          providerId: 'default',
          type: 'ecs-service-custom',
          owner: 'team1',
          component: 'app1',
          system: 'some-system',
          metadataName: 'test1-111',
          annotations: {
            'aws.amazon.com/account-id': '111',
          },
        }),
        createResource({
          name: 'test2',
          accountId: '222',
          region: 'us-west-2',
          resourceType: 'AWS::ECS::Service',
          providerId: 'default',
          type: 'ecs-service-custom',
          system: 'some-system',
          metadataName: 'test2-222',
          annotations: {
            'aws.amazon.com/account-id': '222',
          },
        }),
      ],
      "SELECT resourceId, resourceName, resourceType, awsRegion, accountId, arn, tags, configuration WHERE resourceType IN ('AWS::ECS::Service')",
    );
  });

  // eslint-disable-next-line jest/expect-expect
  it('should apply mutation and hash entity names', async () => {
    mock.on(SelectResourceConfigCommand).callsFake(async _ => {
      return {
        Results: [
          JSON.stringify(
            mockResource(
              'test1',
              '111',
              'us-west-2',
              'AWS::ECS::Service',
              { PlatformVersion: 'LATEST' },
              { component: 'app1', owner: 'team1', system: 'system1' },
            ),
          ),
        ],
      };
    });

    return expectMutation(
      'default',
      {
        filters: { resourceTypes: ['AWS::ECS::Service'] },
        hashEntityNames: true,
      },
      [
        createResource({
          arn: 'arn:aws:xxx:us-west-2:111:/test1',
          title: 'test1',
          description: 'AWS Config Resource AWS::ECS::Service test1',
          name: '3e8bd21376e252c57277d4a7a3d618ef3a1597a05dc2326f028a69a7d6a172a',
          accountId: '111',
          region: 'us-west-2',
          resourceType: 'AWS::ECS::Service',
          providerId: 'default',
          type: 'ecs-service',
          metadataName:
            '3e8bd21376e252c57277d4a7a3d618ef3a1597a05dc2326f028a69a7d6a172a',
        }),
      ],
      "SELECT resourceId, resourceName, resourceType, awsRegion, accountId, arn, tags, configuration WHERE resourceType IN ('AWS::ECS::Service')",
    );
  });
});

function createResource({
  arn,
  name,
  description,
  title,
  accountId,
  region,
  resourceType,
  providerId,
  type,
  owner = 'unknown',
  component,
  system,
  metadataName,
  annotations = {},
}: {
  arn?: string;
  name: string;
  description?: string;
  title?: string;
  accountId: string;
  region: string;
  resourceType: string;
  providerId: string;
  type: string;
  owner?: string;
  component?: string;
  system?: string;
  metadataName?: string;
  annotations?: any;
}) {
  const actualArn = arn ?? `arn:aws:xxx:${region}:${accountId}:/${name}`;
  const location = `aws-config-provider:${providerId}`;

  const entity: any = {
    entity: {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Resource',
      metadata: {
        annotations: {
          'aws.amazon.com/arn': actualArn,
          'aws.amazon.com/name': name,
          'aws.amazon.com/region': region,
          'aws.amazon.com/resource-id': actualArn,
          'aws.amazon.com/resource-type': resourceType,
          'backstage.io/managed-by-location': location,
          'backstage.io/managed-by-origin-location': location,
          ...annotations,
        },
        name: metadataName ?? name,
        description:
          description ?? `AWS Config Resource ${resourceType} ${name}`,
        title: title,
      },
      spec: {
        owner,
        type,
        system,
      },
    },
  };

  if (component) {
    entity.entity.spec.dependencyOf = [`component:${component}`];
  }

  return entity;
}
