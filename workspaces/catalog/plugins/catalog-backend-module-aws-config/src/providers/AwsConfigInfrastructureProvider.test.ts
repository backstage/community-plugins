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
} from '@aws-sdk/client-config-service';
import { mockServices } from '@backstage/backend-test-utils';
import { mockResource } from './mocks';

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
