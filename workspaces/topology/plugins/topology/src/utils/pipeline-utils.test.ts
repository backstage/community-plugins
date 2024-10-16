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
import { mockKubernetesResponse } from '../__fixtures__/1-deployments';
import { mockTektonResources } from '../__fixtures__/1-tektonResources';
import { K8sResponseData } from '../types/types';
import {
  getPipelineRunsForPipeline,
  getPipelinesDataForResource,
} from './pipeline-utils';

describe('getPipelineRunsForPipeline', () => {
  it('should return an empty array when pipeline runs data is empty', () => {
    const pipeline = mockTektonResources.pipelines[0];
    const resources = {
      pipelineruns: {
        data: [],
      },
    };

    const result = getPipelineRunsForPipeline(pipeline, resources);

    expect(result).toEqual([]);
  });

  it('should return an empty array when pipeline name does not match', () => {
    const resources = {
      pipelineruns: {
        data: mockTektonResources.pipelineruns as any,
      },
    } as K8sResponseData;
    const pipeline = mockTektonResources.pipelines[0];

    const result = getPipelineRunsForPipeline(
      {
        ...pipeline,
        metadata: { ...pipeline.metadata, name: 'nationalparks-py' },
      },
      resources,
    );

    expect(result).toEqual([]);
  });

  it('should return an array of pipeline runs when pipeline name matches', () => {
    const resources = {
      pipelineruns: {
        data: mockTektonResources.pipelineruns as any,
      },
    } as K8sResponseData;
    const pipeline = mockTektonResources.pipelines[0];

    const result = getPipelineRunsForPipeline(pipeline, resources);

    expect(result.length).toEqual(1);
  });
});

describe('getPipelinesDataForResource', () => {
  it('should return null when pipelines data is empty', () => {
    const resource: any = mockKubernetesResponse.deployments[0];

    const resources = {
      pipelines: {
        data: [],
      },
    };

    const result = getPipelinesDataForResource(resources, resource);

    expect(result).toBe(null);
  });

  it('should return undefined when resource instance name is not available/different', () => {
    const resource: any = mockKubernetesResponse.deployments[0];
    const pipeline = mockTektonResources.pipelines[0];

    const resources = {
      pipelines: {
        data: [
          {
            ...pipeline,
            metadata: {
              ...pipeline.metadata,
              labels: {},
            },
          },
        ],
      },
    } as K8sResponseData;

    const result = getPipelinesDataForResource(resources, resource);

    expect(result).toBe(null);
  });

  it('should return pipelines and pipeline runs data for a matching resource', () => {
    const resource: any = mockKubernetesResponse.deployments[0];
    const pipeline = mockTektonResources.pipelines[0];

    const resources = {
      pipelines: {
        data: [pipeline as any],
      },
      pipelineruns: {
        data: mockTektonResources.pipelineruns as any,
      },
    } as K8sResponseData;

    const result = getPipelinesDataForResource(resources, resource);

    expect(result).toEqual({
      pipelines: [mockTektonResources.pipelines[0]],
      pipelineRuns: [mockTektonResources.pipelineruns[0]],
      taskRuns: [],
    });
  });
});
