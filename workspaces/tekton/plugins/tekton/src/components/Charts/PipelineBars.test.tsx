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

import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import PipelineBars from './PipelineBars';
import { renderInTestApp } from '@backstage/test-utils';

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => () => {
    return {
      titleContainer: 'title',
      closeButton: 'close',
    };
  },
  Dialog: () => <div data-testid="dialog" />,
}));

describe('PipelineBars', () => {
  it('should show PipelineBars & Dialog', async () => {
    const pipelineRun = mockKubernetesPlrResponse.pipelineruns[0];
    const { queryByTestId } = await renderInTestApp(
      <PipelineBars pipelineRun={pipelineRun} />,
    );
    expect(
      queryByTestId(`horizontal-stacked-bars-${pipelineRun.metadata.name}`),
    ).toBeInTheDocument();
    expect(queryByTestId('dialog')).toBeInTheDocument();
  });
});
