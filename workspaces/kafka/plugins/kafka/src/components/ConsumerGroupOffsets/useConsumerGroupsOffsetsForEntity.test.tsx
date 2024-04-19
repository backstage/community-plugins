/*
 * Copyright 2020 The Backstage Authors
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
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderHook, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import React, { PropsWithChildren } from 'react';
import {
  ConsumerGroupOffsetsResponse,
  KafkaApi,
  kafkaApiRef,
  KafkaDashboardApi,
  kafkaDashboardApiRef,
} from '../../api/types';
import { useConsumerGroupsOffsetsForEntity } from './useConsumerGroupsOffsetsForEntity';
import * as data from './__fixtures__/consumer-group-offsets.json';

import { errorApiRef } from '@backstage/core-plugin-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';

const consumerGroupOffsets = data as ConsumerGroupOffsetsResponse;

const mockErrorApi: jest.Mocked<typeof errorApiRef.T> = {
  post: jest.fn(),
  error$: jest.fn(),
};

const mockKafkaApi: jest.Mocked<KafkaApi> = {
  getConsumerGroupOffsets: jest.fn(),
};

const mockKafkaDashboardApi: jest.Mocked<KafkaDashboardApi> = {
  getDashboardUrl: jest.fn(),
};

// @ts-ignore
const mockConfigApi: jest.Mocked<typeof configApiRef.T> = {
  getConfigArray: jest.fn(_ => []),
};

describe('useConsumerGroupOffsets', () => {
  const entity: Entity = {
    apiVersion: 'v1',
    kind: 'Component',
    metadata: {
      name: 'test',
      annotations: {
        'kafka.apache.org/consumer-groups': `prod/${consumerGroupOffsets.consumerId}`,
      },
    },
    spec: {
      owner: 'guest',
      type: 'Website',
      lifecycle: 'development',
    },
  };

  const wrapper = ({ children }: PropsWithChildren<{}>) => {
    return (
      <TestApiProvider
        apis={[
          [errorApiRef, mockErrorApi],
          [kafkaApiRef, mockKafkaApi],
          [kafkaDashboardApiRef, mockKafkaDashboardApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityProvider entity={entity}>{children}</EntityProvider>
      </TestApiProvider>
    );
  };

  const subject = () =>
    renderHook(useConsumerGroupsOffsetsForEntity, { wrapper });

  it('returns correct consumer group for annotation', async () => {
    mockKafkaApi.getConsumerGroupOffsets.mockResolvedValue(
      consumerGroupOffsets,
    );
    when(mockKafkaApi.getConsumerGroupOffsets)
      .calledWith('prod', consumerGroupOffsets.consumerId)
      .mockResolvedValue(consumerGroupOffsets);
    when(mockKafkaDashboardApi.getDashboardUrl).mockReturnValue({});

    const { result } = subject();

    await waitFor(() => {
      expect(result.current[0].consumerGroupsTopics).toStrictEqual([
        {
          clusterId: 'prod',
          consumerGroup: consumerGroupOffsets.consumerId,
          dashboardUrl: undefined,
          topics: consumerGroupOffsets.offsets,
        },
      ]);
    });
  });

  it('posts an error to the error api', async () => {
    const error = new Error('error!');
    mockKafkaApi.getConsumerGroupOffsets.mockRejectedValueOnce(error);

    subject();

    await waitFor(() => {
      expect(mockErrorApi.post).toHaveBeenCalledWith(error);
    });
  });
});
