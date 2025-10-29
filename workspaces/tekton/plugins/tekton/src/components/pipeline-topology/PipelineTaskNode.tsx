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
import type { LegacyRef } from 'react';

import { useState, useContext, useRef, useMemo, memo } from 'react';

import { Tooltip } from '@patternfly/react-core';
import {
  DEFAULT_LAYER,
  DEFAULT_WHEN_OFFSET,
  GraphElement,
  Layer,
  Node,
  RunStatus,
  ScaleDetailsLevel,
  TaskNode,
  TOP_LAYER,
  useDetailsLevel,
  useHover,
  WhenDecorator,
  WithContextMenuProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { observer } from 'mobx-react';

import { PipelineTaskWithStatus, TaskRunKind } from '@janus-idp/shared-react';

import { NodeType } from '../../consts/pipeline-topology-const';
import {
  TEKTON_PIPELINE_RUN,
  TEKTON_PIPELINE_TASK,
} from '../../consts/tekton-const';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { StepStatus } from '../../types/taskRun';
import { TektonResourcesContextData } from '../../types/types';
import { createStepStatus } from '../../utils/pipeline-step-utils';
import { getTaskStatus } from '../../utils/pipelineRun-utils';
import PipelineRunLogDialog from '../PipelineRunLogs/PipelineRunLogDialog';
import { PipelineVisualizationStepList } from './PipelineVisualizationStepList';

import './PipelineTaskNode.css';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

type PipelineTaskNodeProps = {
  element: Node;
} & WithContextMenuProps &
  WithSelectionProps &
  GraphElement;

const PipelineTaskNode = ({
  element,
  onContextMenu,
  contextMenuOpen,
  ...rest
}: PipelineTaskNodeProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const { watchResourcesData } = useContext<TektonResourcesContextData>(
    TektonResourcesContext,
  );
  const { t } = useTranslationRef(tektonTranslationRef);
  const data = element.getData();
  const triggerRef = useRef<SVGGElement | null>(null);

  const pipelineRun = data.pipelineRun;
  const [hover, hoverRef] = useHover();
  const detailsLevel = useDetailsLevel();
  const isFinallyTask = element.getType() === NodeType.FINALLY_NODE;

  const pods = watchResourcesData?.pods?.data || [];
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const computedTask: PipelineTaskWithStatus = data.task;
  const stepList =
    computedTask?.status?.steps || computedTask?.taskSpec?.steps || [];

  const taskStatus = getTaskStatus(data.pipelineRun, data.task);

  const stepStatusList: StepStatus[] = stepList.map((step: { name: string }) =>
    createStepStatus(step, taskStatus, t),
  );
  const succeededStepsCount = stepStatusList.filter(
    ({ status }) => status === RunStatus.Succeeded,
  ).length;

  const badge =
    stepStatusList.length > 0 && data.status
      ? `${succeededStepsCount}/${stepStatusList.length}`
      : null;

  const passedData = useMemo(() => {
    const newData = { ...data };
    Object.keys(newData).forEach(key => {
      if (newData[key] === undefined) {
        delete newData[key];
      }
    });
    return newData;
  }, [data]);

  const hasTaskIcon = !!(data.taskIconClass || data.taskIcon);
  const whenDecorator = data.whenStatus ? (
    <WhenDecorator
      element={element}
      status={data.whenStatus}
      leftOffset={
        hasTaskIcon
          ? DEFAULT_WHEN_OFFSET + (element.getBounds().height - 4) * 0.75
          : DEFAULT_WHEN_OFFSET
      }
    />
  ) : null;
  const activeTaskId = taskRuns.find(
    (tr: TaskRunKind) =>
      tr?.metadata?.labels?.[TEKTON_PIPELINE_RUN] ===
        pipelineRun?.metadata?.name &&
      tr?.metadata?.labels?.[TEKTON_PIPELINE_TASK] === data.task?.name,
  )?.metadata?.name;

  const taskNode = (
    <>
      <PipelineRunLogDialog
        pipelineRun={pipelineRun}
        open={open}
        closeDialog={closeDialog}
        pods={pods}
        taskRuns={taskRuns}
        activeTask={activeTaskId}
      />
      <TaskNode
        className="bs-tkn-pipeline-task-node"
        element={element}
        onContextMenu={data.showContextMenu ? onContextMenu : undefined}
        contextMenuOpen={contextMenuOpen}
        scaleNode={
          (hover || contextMenuOpen) && detailsLevel !== ScaleDetailsLevel.high
        }
        hideDetailsAtMedium
        {...passedData}
        {...rest}
        badge={badge}
        truncateLength={element.getData()?.label?.length}
        onSelect={activeTaskId && openDialog}
      >
        {whenDecorator}
      </TaskNode>
    </>
  );

  return (
    <Layer
      id={
        detailsLevel !== ScaleDetailsLevel.high && (hover || contextMenuOpen)
          ? TOP_LAYER
          : DEFAULT_LAYER
      }
    >
      <g
        data-test={`task ${element.getLabel()}`}
        className="bs-tkn-pipeline-task-node"
        ref={hoverRef as LegacyRef<SVGGElement>}
      >
        <Tooltip
          position="bottom"
          enableFlip={false}
          content={
            <PipelineVisualizationStepList
              isSpecOverview={!data.status}
              taskName={element.getLabel()}
              steps={stepStatusList}
              isFinallyTask={isFinallyTask}
            />
          }
          triggerRef={triggerRef}
        >
          <g ref={triggerRef}>{taskNode}</g>
        </Tooltip>
      </g>
    </Layer>
  );
};

export default memo(observer(PipelineTaskNode));
