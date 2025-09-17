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
import { render } from '@testing-library/react';

import { mockTektonResources } from '../../../__fixtures__/1-tektonResources';
import { mockUseTranslation } from '../../../test-utils/mockTranslations';
import PLRlist from './PLRlist';

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: () => (_theme: any) => {
    return {
      ok: 'ok',
    };
  },
}));

describe('PLRlist', () => {
  it('shows the workload pipeline', () => {
    const pipelines = mockTektonResources.pipelines;
    const { getByText } = render(
      <PLRlist pipelines={pipelines} pipelineRuns={[]} />,
    );

    pipelines.forEach(pipeline => {
      const pipelineName = getByText(pipeline.metadata.name);
      expect(pipelineName).toBeInTheDocument();
    });
  });

  it('renders the list of pipeline runs', () => {
    const pipelineRuns: any[] = [
      ...mockTektonResources.pipelineruns,
      {
        ...mockTektonResources.pipelineruns[0],
        metadata: {
          ...mockTektonResources.pipelineruns[0].metadata,
          name: 'nationalparks-py2-9591xb',
          uid: '974e5124-c6b4-49c1-8960-d64740f47020',
        },
      },
    ];
    const { getByText } = render(
      <PLRlist pipelines={[]} pipelineRuns={pipelineRuns} />,
    );

    pipelineRuns.forEach(pipelineRun => {
      const pipelineRunName = getByText(pipelineRun.metadata.name);
      expect(pipelineRunName).toBeInTheDocument();
    });
  });

  it('renders "No PipelineRuns found" when no pipeline runs exist', () => {
    const { getByText } = render(<PLRlist pipelines={[]} pipelineRuns={[]} />);
    const noPipelineRunsMessage = getByText(/no pipelineruns found/i);

    expect(noPipelineRunsMessage).toBeInTheDocument();
  });
});
