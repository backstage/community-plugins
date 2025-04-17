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
import React from 'react';
import { ComputedStatus } from '@janus-idp/shared-react';

import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { PipelineVisualizationView } from './PipelineVisualizationView';
import { renderInTestApp } from '@backstage/test-utils';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => () => '/xyz',
}));

describe('PipelineVisualizationView', () => {
  it('should render the pipeline run visualization when pipelineRun name exists in the params', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: mockKubernetesPlrResponse.pipelineruns,
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
      selectedStatus: ComputedStatus.All,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };
    const { queryByTestId } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualizationView pipelineRun="pipeline-test-wbvtlk" />
      </TektonResourcesContext.Provider>,
    );
    expect(queryByTestId('pipelineRun-visualization')).toBeInTheDocument();
  });
});
