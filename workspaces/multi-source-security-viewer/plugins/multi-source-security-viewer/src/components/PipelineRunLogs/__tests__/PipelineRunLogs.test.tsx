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
import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { PipelineRunLogs } from '../PipelineRunLogs';
import { PipelineRunResult } from '../../../models/pipelineRunResult';
import { mockRawLogs } from '../../../__fixtures__/rawlogs';

describe('PipelineRunLogs', () => {
  const pipelineRun = new PipelineRunResult({
    id: 'pr-1',
    displayName: 'pipelinerun-1',
    logs: mockRawLogs,
  });

  it('should have download buttons', async () => {
    await renderInTestApp(<PipelineRunLogs pr={pipelineRun} />);
    expect(screen.getByTestId('download-logfile')).toBeInTheDocument();
    expect(screen.getByTestId('download-logstep')).toBeInTheDocument();
  });

  it('should display the pipeline steps', async () => {
    await renderInTestApp(<PipelineRunLogs pr={pipelineRun} />);
    expect(screen.getAllByTestId('step-label').length).toBe(9);
    expect(screen.getByTestId('step-log')).toBeInTheDocument();
  });
});
