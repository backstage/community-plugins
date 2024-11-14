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

import '@testing-library/jest-dom';

import { useApi } from '@backstage/core-plugin-api';

import { render, screen, waitFor } from '@testing-library/react';

import { mockKubernetesPlrResponse } from '../../../__fixtures__/1-pipelinesData';
import { acsImageCheckResults } from '../../../__fixtures__/advancedClusterSecurityData';
import { enterpriseContractResult } from '../../../__fixtures__/enterpriseContractData';
import PipelineRunOutput from '../PipelineRunOutput';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('PipelineRunOutput', () => {
  beforeEach(() => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValue({ text: 'data' }),
    });
  });

  it('should render the progress bar', async () => {
    render(
      <PipelineRunOutput
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[0]}
        taskRuns={mockKubernetesPlrResponse.taskruns}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('progress')).toBeInTheDocument();
    });
  });

  it('should render the results table', async () => {
    render(
      <PipelineRunOutput
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[4]}
        taskRuns={mockKubernetesPlrResponse.taskruns}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('results-table')).toBeInTheDocument();
      expect(screen.queryByText('MY_SCAN_OUTPUT')).toBeInTheDocument();
    });
  });

  it('should render the results table and ACS section', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockImplementation(({ podName }) => {
        if (podName.includes('image-check')) {
          return Promise.resolve({
            text: JSON.stringify(acsImageCheckResults),
          });
        }
        return Promise.resolve({ text: 'data' });
      }),
    });
    render(
      <PipelineRunOutput
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[2]}
        taskRuns={mockKubernetesPlrResponse.taskruns}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Advanced Cluster Security'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Others')).toBeInTheDocument();
    });
  });

  it('should render the EC and Others reports section', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockImplementation(({ podName }) => {
        if (podName.includes('ec-task')) {
          return Promise.resolve({
            text: JSON.stringify(enterpriseContractResult),
          });
        }
        return Promise.resolve({ text: 'data' });
      }),
    });
    render(
      <PipelineRunOutput
        pipelineRun={mockKubernetesPlrResponse.pipelineruns[2]}
        taskRuns={mockKubernetesPlrResponse.taskruns}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText('Enterprise Contract')).toBeInTheDocument();
      expect(screen.queryByText('Others')).toBeInTheDocument();
    });
  });
});
