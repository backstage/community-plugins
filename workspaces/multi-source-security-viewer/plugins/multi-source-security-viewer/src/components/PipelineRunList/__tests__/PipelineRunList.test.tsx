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
import { render, screen, waitFor } from '@testing-library/react';
import { PipelineRunList } from '../PipelineRunList';
import { mockPipelineRuns } from '../../../__fixtures__/pipelineruns';
import { PipelineRunResult } from '../../../models/pipelineRunResult';

jest.mock('../../../hooks/usePipelineSummary', () => ({
  usePipelineSummary: jest.fn(),
}));

const mockData = mockPipelineRuns.map(pr => new PipelineRunResult(pr));

describe('PipelineRunList', () => {
  it('should render a list of pipeline runs', async () => {
    render(
      <PipelineRunList
        data={mockData}
        totalCount={mockData.length}
        loading={false}
        error={null}
        onUpdatePagination={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('pipeline-run-1')).toBeInTheDocument();
      expect(screen.getByText('pipeline-run-2')).toBeInTheDocument();
    });
  });

  it('should render a loading spinner', async () => {
    render(
      <PipelineRunList
        data={mockData}
        totalCount={mockData.length}
        loading
        error={null}
        onUpdatePagination={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  it('should render an empty state if no data', async () => {
    render(
      <PipelineRunList
        data={[]}
        totalCount={0}
        loading={false}
        error={null}
        onUpdatePagination={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('No Pipeline Runs')).toBeInTheDocument();
    });
  });

  it('should render an error message', async () => {
    render(
      <PipelineRunList
        data={mockData}
        totalCount={mockData.length}
        loading={false}
        error={new Error('error')}
        onUpdatePagination={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Error: error')).toBeInTheDocument();
    });
  });
});
