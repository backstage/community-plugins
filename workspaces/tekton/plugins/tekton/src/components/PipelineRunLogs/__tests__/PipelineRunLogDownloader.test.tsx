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

import { render, screen } from '@testing-library/react';

import { testPipelineRunPods } from '../../../__fixtures__/pods-data';
import PipelineRunLogDownloader from '../PipelineRunLogDownloader';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('PipelineRunLogDownloader', () => {
  it('should not show download links', () => {
    const { pipelineRun } = testPipelineRunPods;
    render(
      <PipelineRunLogDownloader
        pods={[]}
        pipelineRun={pipelineRun}
        activeTask={undefined}
      />,
    );

    expect(screen.queryByTestId('download-task-logs')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('download-pipelinerun-logs'),
    ).not.toBeInTheDocument();
  });

  it('should return download links', () => {
    const { pipelineRun, pods } = testPipelineRunPods;
    render(
      <PipelineRunLogDownloader
        pods={pods}
        pipelineRun={pipelineRun}
        activeTask={undefined}
      />,
    );

    expect(screen.getByTestId('download-task-logs')).toBeInTheDocument();
    expect(screen.getByTestId('download-pipelinerun-logs')).toBeInTheDocument();
  });
});
