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
import { render, screen } from '@testing-library/react';
import { PipelineRunTableRowActions } from '../PipelineRunTableRowActions';
import { mockPipelineRuns } from '../../../__fixtures__/pipelineruns';
import { PipelineRunResult } from '../../../models/pipelineRunResult';

const pr = mockPipelineRuns.map(p => new PipelineRunResult(p))[0];

describe('PipelineRunTableRowActions', () => {
  it('should display the logs and output buttons', () => {
    render(<PipelineRunTableRowActions pr={pr} />);
    expect(screen.getByTestId('button-output')).toBeInTheDocument();
    expect(screen.getByTestId('button-logs')).toBeInTheDocument();
  });
});
