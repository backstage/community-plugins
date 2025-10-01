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
import { PipelineRunKind, TaskRunKind } from '@janus-idp/shared-react';

import { useDarkTheme } from '../../hooks/useDarkTheme';
import { getGraphDataModel } from '../../utils/pipeline-topology-utils';
import { PipelineLayout } from './PipelineLayout';

import './PipelineVisualization.css';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

type PipelineVisualizationProps = {
  pipelineRun: PipelineRunKind | null;
  taskRuns: TaskRunKind[];
};

export const PipelineVisualization = ({
  pipelineRun,
  taskRuns,
}: PipelineVisualizationProps) => {
  useDarkTheme();

  const model = getGraphDataModel(pipelineRun ?? undefined, taskRuns ?? []);
  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <>
      {!model || (model.nodes.length === 0 && model.edges.length === 0) ? (
        <div data-testid="pipeline-no-tasks">
          {t('pipelineVisualization.noTasksDescription')}
        </div>
      ) : (
        <div
          data-testid="pipelineRun-visualization"
          className="bs-tkn-pipeline-visualization__layout"
        >
          <PipelineLayout model={model} />
        </div>
      )}
    </>
  );
};
