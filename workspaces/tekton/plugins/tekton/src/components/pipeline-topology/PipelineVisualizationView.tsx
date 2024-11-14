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

import { EmptyState, Progress } from '@backstage/core-components';

import { isEmpty } from 'lodash';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { getPipelineRun } from '../../utils/pipelineRun-utils';
import { PipelineVisualization } from './PipelineVisualization';

import './PipelineVisualization.css';

type PipelineVisualizationViewProps = {
  pipelineRun: string;
};

export const PipelineVisualizationView = ({
  pipelineRun,
}: PipelineVisualizationViewProps) => {
  const { loaded, responseError, watchResourcesData } = React.useContext(
    TektonResourcesContext,
  );

  const pipelineRunResource = React.useMemo(
    () =>
      getPipelineRun(watchResourcesData?.pipelineruns?.data ?? [], pipelineRun),
    [watchResourcesData, pipelineRun],
  );

  if (!loaded)
    return (
      <div data-testid="tekton-progress">
        <Progress />
      </div>
    );

  if (loaded && (responseError || isEmpty(pipelineRunResource))) {
    return (
      <EmptyState
        missing="data"
        description="No Pipeline Run to visualize"
        title=""
      />
    );
  }

  return (
    <PipelineVisualization
      pipelineRun={pipelineRunResource}
      taskRuns={watchResourcesData?.taskruns?.data ?? []}
    />
  );
};
