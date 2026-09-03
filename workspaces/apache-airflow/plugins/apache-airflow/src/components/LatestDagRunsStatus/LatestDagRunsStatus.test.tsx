/*
 * Copyright 2022 The Backstage Authors
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
import { ApacheAirflowApi, apacheAirflowApiRef } from '../../api';
import { DagRun } from '../../api/types/Dags';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

const mockApi: jest.Mocked<ApacheAirflowApi> = {
  getDagRuns: jest.fn().mockResolvedValue([
    {
      dag_run_id: 'mock dag run 1',
      dag_id: 'mock_dag_1',
      logical_date: '2022-05-27T11:25:23.251274+00:00',
      start_date: '2022-05-27T11:25:23.251274+00:00',
      end_date: '2022-05-27T11:25:23.251274+00:00',
      state: 'success',
      external_trigger: true,
      conf: {},
    },
    {
      dag_run_id: 'mock dag run 2',
      dag_id: 'mock_dag_1',
      logical_date: '2022-05-27T11:25:23.251274+00:00',
      start_date: '2022-05-27T11:25:23.251274+00:00',
      end_date: '2022-05-27T11:25:23.251274+00:00',
      state: 'running',
      external_trigger: true,
      conf: {},
    },
    {
      dag_run_id: 'mock dag run 3',
      dag_id: 'mock_dag_1',
      logical_date: '2022-05-27T11:25:23.251274+00:00',
      start_date: '2022-05-27T11:25:23.251274+00:00',
      end_date: '2022-05-27T11:25:23.251274+00:00',
      state: 'failed',
      external_trigger: true,
      conf: {},
    },
    {
      dag_run_id: 'mock dag run 4',
      dag_id: 'mock_dag_1',
      logical_date: '2022-05-27T11:25:23.251274+00:00',
      start_date: '2022-05-27T11:25:23.251274+00:00',
      end_date: '2022-05-27T11:25:23.251274+00:00',
      state: 'queued',
      external_trigger: true,
      conf: {},
    },
  ] as DagRun[]),
} as any;
jest.mock('@backstage/core-plugin-api', () => ({
  useApi: () => mockApi,
}));
jest.mock('@backstage/core-components', () => ({
  Progress: () => <div>loading</div>,
  StatusError: () => <span aria-label="Status error" />,
  StatusOK: () => <span aria-label="Status ok" />,
  StatusPending: () => <span aria-label="Status pending" />,
  StatusRunning: () => <span aria-label="Status running" />,
}));
jest.mock('@backstage/ui', () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  Tooltip: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));
jest.mock('./DagRunTooltipContent', () => ({
  DagRunTooltipContent: () => <div>tooltip</div>,
}));
import { LatestDagRunsStatus } from './LatestDagRunsStatus';

describe('LatestDagRunsStatus', () => {
  it('should render the status of mock dag 1', async () => {
    const dagId = 'mock_dag_1';

    render(<LatestDagRunsStatus dagId={dagId} />);
    expect(await screen.findByLabelText('Status ok')).toBeInTheDocument();
    expect(await screen.findByLabelText('Status running')).toBeInTheDocument();
    expect(await screen.findByLabelText('Status error')).toBeInTheDocument();
    expect(await screen.findByLabelText('Status pending')).toBeInTheDocument();
  });
});
