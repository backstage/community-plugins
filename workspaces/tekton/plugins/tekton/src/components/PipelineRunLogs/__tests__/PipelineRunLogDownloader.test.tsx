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
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes-react';

import { testPipelineRunPods } from '../../../__fixtures__/pods-data';
import PipelineRunLogDownloader from '../PipelineRunLogDownloader';

describe('PipelineRunLogDownloader', () => {
  it('should not show download links', async () => {
    const { pipelineRun } = testPipelineRunPods;
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
        <PipelineRunLogDownloader
          pods={[]}
          pipelineRun={pipelineRun}
          activeTask={undefined}
        />
      </TestApiProvider>,
    );

    expect(screen.queryByTestId('download-task-logs')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('download-pipelinerun-logs'),
    ).not.toBeInTheDocument();
  });

  it('should return download links', async () => {
    const { pipelineRun, pods } = testPipelineRunPods;
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
        <PipelineRunLogDownloader
          pods={pods}
          pipelineRun={pipelineRun}
          activeTask={undefined}
        />
      </TestApiProvider>,
    );

    expect(screen.getByTestId('download-task-logs')).toBeInTheDocument();
    expect(screen.getByTestId('download-pipelinerun-logs')).toBeInTheDocument();
  });
});
