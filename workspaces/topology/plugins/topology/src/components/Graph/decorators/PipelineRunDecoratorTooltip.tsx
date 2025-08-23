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
import { random } from 'lodash';

import {
  ComputedStatus,
  getRunStatusColor,
  getTaskStatus,
  HorizontalStackedBars,
  PipelineRunKind,
  TaskRunKind,
  TaskStatusTooltip,
  TaskStatusTypes,
} from '@janus-idp/shared-react';

import './PipelineRunDecoratorTooltip.css';

const PipelineRunDecoratorTooltip = ({
  pipelineRun,
  status,
  taskRuns,
}: {
  pipelineRun: PipelineRunKind | null;
  status: string | null;
  taskRuns: TaskRunKind[];
}) => {
  if (!pipelineRun || !status) {
    return null;
  }
  const taskStatus = getTaskStatus(pipelineRun, taskRuns);

  const pipelineBars = (
    <HorizontalStackedBars
      id={pipelineRun?.metadata?.uid ?? random().toString()}
      height="1em"
      inline
      values={Object.keys(ComputedStatus).map(rStatus => ({
        color: getRunStatusColor(
          ComputedStatus[rStatus as keyof typeof ComputedStatus],
        ).color,
        name: rStatus,
        size: taskStatus[
          ComputedStatus[
            rStatus as keyof typeof ComputedStatus
          ] as keyof TaskStatusTypes
        ],
      }))}
    />
  );

  const breakdownInfo = <TaskStatusTooltip taskStatus={taskStatus} />;

  return (
    <div className="bs-topology-pipelinerun-decorator-tooltip">
      <div className="bs-topology-pipelinerun-decorator-tooltip__title">
        {`Pipeline ${status}`}
      </div>
      <div className="bs-topology-pipelinerun-decorator-tooltip__status-bars-wrapper">
        <div className="bs-topology-pipelinerun-decorator-tooltip__status-bars-title">
          Task status
        </div>
        <div className="bs-topology-pipelinerun-decorator-tooltip__status-bars">
          {pipelineBars}
        </div>
      </div>
      <div className="bs-topology-pipelinerun-decorator-tooltip__status-breakdown">
        {breakdownInfo}
      </div>
    </div>
  );
};

export default PipelineRunDecoratorTooltip;
