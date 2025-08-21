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
import { Theme } from '@material-ui/core';
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes-react';

import { testPipelineRunPods } from '../../../__fixtures__/pods-data';
import PipelineRunLogDialog from '../PipelineRunLogDialog';

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: (cb: any) => (theme: Theme) =>
    cb({
      ...theme,
      spacing: () => 0,
      palette: { grey: { 500: 'grey' } },
    }),
}));

jest.mock('@backstage/core-components', () => ({
  ErrorBoundary: (props: any) => <>{props.children}</>,
}));

jest.mock('../PipelineRunLogs', () => () => <div>Pipeline run logs</div>);

describe('PipelineRunLogDialog', () => {
  it('should not show pipeline run logs modal', async () => {
    const closeDialog = jest.fn();
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [
            kubernetesProxyApiRef,
            {
              getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
            },
          ],
        ]}
      >
        <PipelineRunLogDialog
          open={false}
          closeDialog={closeDialog}
          pods={[]}
          taskRuns={[]}
          pipelineRun={testPipelineRunPods.pipelineRun}
        />
        ,
      </TestApiProvider>,
    );

    expect(
      screen.queryByTestId('pipelinerun-logs-dialog'),
    ).not.toBeInTheDocument();
  });

  it('should show pipeline run logs modal', async () => {
    const closeDialog = jest.fn();
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [
            kubernetesProxyApiRef,
            {
              getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
            },
          ],
        ]}
      >
        <PipelineRunLogDialog
          open
          closeDialog={closeDialog}
          pods={[]}
          taskRuns={[]}
          pipelineRun={testPipelineRunPods.pipelineRun}
        />
      </TestApiProvider>,
    );

    expect(screen.getByTestId('pipelinerun-logs-dialog')).toBeInTheDocument();
  });

  it('should not show download links in the logs modal if there are no pods', async () => {
    const closeDialog = jest.fn();
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [
            kubernetesProxyApiRef,
            {
              getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
            },
          ],
        ]}
      >
        <PipelineRunLogDialog
          open
          closeDialog={closeDialog}
          pods={[]}
          taskRuns={[]}
          pipelineRun={testPipelineRunPods.pipelineRun}
        />
      </TestApiProvider>,
    );

    expect(screen.getByTestId('pipelinerun-logs-dialog')).toBeInTheDocument();

    expect(
      screen.queryByTestId('pipelinerun-logs-downloader'),
    ).not.toBeInTheDocument();
  });

  it('should show download links in the logs modal if pods are available', async () => {
    const closeDialog = jest.fn();
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [
            kubernetesProxyApiRef,
            {
              getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
            },
          ],
        ]}
      >
        <PipelineRunLogDialog
          open
          closeDialog={closeDialog}
          pods={testPipelineRunPods.pods}
          taskRuns={[]}
          pipelineRun={testPipelineRunPods.pipelineRun}
        />
      </TestApiProvider>,
    );

    expect(screen.getByTestId('pipelinerun-logs-dialog')).toBeInTheDocument();
    expect(
      screen.queryByTestId('pipelinerun-logs-downloader'),
    ).toBeInTheDocument();
  });
});
