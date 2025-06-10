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
import '@testing-library/jest-dom';

import { LinkProps } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';

import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { ComputedStatus, PipelineRunKind } from '@janus-idp/shared-react';

import { mockKubernetesPlrResponse } from '../../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../../hooks/TektonResourcesContext';
import { TektonResourcesContextData } from '../../../types/types';
import PipelineRunRowActions from '../PipelineRunRowActions';
import { renderInTestApp } from '@backstage/test-utils';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => () => {
    return {
      titleContainer: 'title',
      closeButton: 'close',
    };
  },
  Dialog: (props: any) => (
    <div data-testid={props['data-testid']}>
      {props.open && <span>Logs modal content</span>}
    </div>
  ),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    Link: (props: LinkProps) => (
      <a href={props.to} data-test={props.to}>
        {props.children}
      </a>
    ),
  };
});

const tektonResourceContextData: TektonResourcesContextData = {
  watchResourcesData: {
    pipelineruns: {
      data: mockKubernetesPlrResponse.pipelineruns,
    },
    taskruns: {
      data: mockKubernetesPlrResponse.taskruns,
    },
    pods: {
      data: mockKubernetesPlrResponse.pods,
    },
  },
  loaded: true,
  responseError: '',
  selectedClusterErrors: [],
  clusters: ['ocp'],
  setSelectedCluster: () => {},
  selectedStatus: ComputedStatus.Other,
  setSelectedStatus: () => {},
  setIsExpanded: () => {},
};

const TestPipelineRunRowActions = ({
  pipelineRun,
}: {
  pipelineRun: PipelineRunKind;
}) => (
  <TektonResourcesContext.Provider value={tektonResourceContextData}>
    <PipelineRunRowActions pipelineRun={pipelineRun} />
  </TektonResourcesContext.Provider>
);

describe('PipelineRunRowActions', () => {
  beforeEach(() => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
  });

  it('should render the icon space holder', async () => {
    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[0]}
      />,
    );

    expect(screen.queryByTestId('icon-space-holder')).toBeInTheDocument();
  });

  it('should render the internal sbom link', async () => {
    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[3]}
      />,
    );

    expect(screen.queryByTestId('internal-sbom-link')).toBeInTheDocument();
  });

  it('should open sbom logs modal when the view SBOM link is clicked', async () => {
    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[3]}
      />,
    );

    expect(screen.queryByTestId('internal-sbom-link')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.queryByTestId('view-sbom-icon') as HTMLElement);
    });

    await waitFor(() => {
      within(
        screen.getByTestId('pipelinerun-logs-dialog') as HTMLElement,
      ).getByText('Logs modal content');
    });
  });

  it('should render the external sbom link', async () => {
    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[4]}
      />,
    );

    expect(screen.queryByTestId('external-sbom-link')).toBeInTheDocument();
  });

  it('should disable the view logs action if the user does not have enough permission', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[1]}
      />,
    );

    expect(screen.queryByTestId('view-logs-icon')).toBeInTheDocument();
    expect(
      screen.queryByTestId('view-logs-icon')?.getAttribute('disabled'),
    ).not.toBeNull();
  });

  it('should not open sbom logs modal when the view external SBOM link is clicked', async () => {
    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[4]}
      />,
    );

    expect(screen.queryByTestId('external-sbom-link')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.queryByTestId('view-sbom-icon') as HTMLElement);
    });

    await waitFor(() => {
      expect(
        within(
          screen.getByTestId('pipelinerun-logs-dialog') as HTMLElement,
        ).queryByText('Logs modal content'),
      ).not.toBeInTheDocument();
    });
  });

  it('should disable the view output action', async () => {
    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[1]}
      />,
    );

    expect(screen.queryByTestId('view-output-icon')).toBeInTheDocument();

    expect(
      screen.queryByTestId('view-output-icon')?.getAttribute('disabled'),
    ).toBeDefined();
  });

  it('should enable the view output action', async () => {
    await renderInTestApp(
      <TestPipelineRunRowActions
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[2]}
      />,
    );

    expect(screen.queryByTestId('view-output-icon')).toBeInTheDocument();

    expect(
      screen.queryByTestId('view-output-icon')?.getAttribute('disabled'),
    ).toBeNull();
  });
});
