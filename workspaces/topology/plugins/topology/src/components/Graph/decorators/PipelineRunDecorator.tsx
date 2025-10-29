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
import { useRef } from 'react';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import {
  getLatestPipelineRun,
  getTaskRunsForPipelineRun,
  pipelineRunStatus,
} from '@janus-idp/shared-react';

import { PipelinesData } from '../../../types/pipeline';
import PipelineDecoratorBubble from './PipelineDecoratorBubble';
import PipelineRunDecoratorTooltip from './PipelineRunDecoratorTooltip';
import { Status } from '../../common/Status';

export const PipelineRunDecorator = ({
  pipelinesData,
  radius,
  x,
  y,
}: {
  pipelinesData: PipelinesData;
  radius: number;
  x: number;
  y: number;
}) => {
  const decoratorRef = useRef<SVGGElement | null>(null);

  const latestPipelineRun = getLatestPipelineRun(
    pipelinesData.pipelineRuns,
    'creationTimestamp',
  );

  const taskRuns = getTaskRunsForPipelineRun(
    latestPipelineRun,
    pipelinesData.taskRuns,
  );

  const status = pipelineRunStatus(latestPipelineRun);
  const statusIcon = <Status status={status} iconOnly />;

  const ariaLabel = `PipelineRun status is ${status}`;
  const tooltipContent = (
    <PipelineRunDecoratorTooltip
      pipelineRun={latestPipelineRun}
      status={status}
      taskRuns={taskRuns}
    />
  );

  const decoratorContent = (
    <PipelineDecoratorBubble x={x} y={y} radius={radius} ariaLabel={ariaLabel}>
      {statusIcon}
    </PipelineDecoratorBubble>
  );

  return (
    <Tooltip
      id="pipeline-run-decorator"
      content={tooltipContent}
      position={TooltipPosition.left}
      triggerRef={decoratorRef}
    >
      <g ref={decoratorRef}>{decoratorContent}</g>
    </Tooltip>
  );
};
