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
import { usePermission } from '@backstage/plugin-permission-react';

import { ComputedStatus } from '@janus-idp/shared-react';

import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import PipelineRunList from './PipelineRunList';
import { renderInTestApp } from '@backstage/test-utils';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'test',
      },
    },
  }),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: () => (_theme: any) => {
    return {
      ok: 'ok',
    };
  },
}));

describe('PipelineRunList', () => {
  beforeEach(() => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
  });

  it('should render PipelineRunList if available', async () => {
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
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: ComputedStatus.All,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { queryByText } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );

    expect(queryByText(/No Pipeline Runs found/i)).toBeNull();
  });

  it('should render loading if data has not been loaded', async () => {
    const mockContextData = {
      watchResourcesData: {},
      loaded: false,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
      selectedStatus: ComputedStatus.All,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { getByTestId } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(getByTestId('tekton-progress')).not.toBeNull();
  });

  it('should show empty state if no data is available', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
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

    const { getByText } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(getByText(/No Pipeline Runs found/i)).not.toBeNull();
  });

  it('should show empty state with no cluster selector if there are error in fetching resources and no clusters', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
      selectedStatus: ComputedStatus.All,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { getByText, queryByText } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    getByText(/No Pipeline Runs found/i);
    expect(queryByText(/Cluster/)).toBeNull();
  });

  it('should show empty state with cluster selector if there are error in fetching resources and cluster(s) are fetched', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      selectedClusterErrors: [{ message: '403 - forbidden' }],
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: ComputedStatus.All,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { getByText, queryByText } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    getByText(/No Pipeline Runs found/i);
    expect(queryByText(/Cluster/)).not.toBeNull();
  });

  it('should render filtered PipelineRunList based on selected status', async () => {
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
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: ComputedStatus.Succeeded,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { queryByText } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );

    expect(queryByText('pipelinerun-with-scanner-task')).not.toBeNull();
  });

  it('should show empty state if no PipelineRuns matches selected status', async () => {
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
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: ComputedStatus.Cancelled,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { queryByText } = await renderInTestApp(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );

    expect(queryByText(/No Pipeline Runs found/i)).not.toBeNull();
  });
});
