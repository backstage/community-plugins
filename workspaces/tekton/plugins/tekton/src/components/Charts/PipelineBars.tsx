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
import { useContext, useState } from 'react';
import './PipelineBars.css';
import { Tooltip } from '@patternfly/react-core';

import {
  ComputedStatus,
  getRunStatusColor,
  getTaskRunsForPipelineRun,
  HorizontalStackedBars,
  PipelineRunKind,
  TaskStatusTooltip,
  TaskStatusTypes,
} from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { getTaskStatusOfPLR } from '../../utils/tekton-utils';
import PipelineRunLogDialog from '../PipelineRunLogs/PipelineRunLogDialog';

type PipelineBarProps = { pipelineRun: PipelineRunKind };

const PipelineBars = ({ pipelineRun }: PipelineBarProps) => {
  const { watchResourcesData } = useContext(TektonResourcesContext);
  const [open, setOpen] = useState<boolean>(false);
  const pods = watchResourcesData?.pods?.data || [];
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const plrTasks = getTaskRunsForPipelineRun(pipelineRun, taskRuns);
  const taskStatus = getTaskStatusOfPLR(pipelineRun, plrTasks);

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <PipelineRunLogDialog
        open={open}
        closeDialog={closeDialog}
        pods={pods}
        taskRuns={taskRuns}
        pipelineRun={pipelineRun}
      />
      <Tooltip content={<TaskStatusTooltip taskStatus={taskStatus} />}>
        <HorizontalStackedBars
          id={`${pipelineRun?.metadata?.name}`}
          onClick={openDialog}
          height="1em"
          inline
          values={Object.keys(ComputedStatus).map(status => ({
            color: getRunStatusColor(
              ComputedStatus[status as keyof typeof ComputedStatus],
            ).color,
            name: status,
            size: taskStatus[
              ComputedStatus[
                status as keyof typeof ComputedStatus
              ] as keyof TaskStatusTypes
            ],
          }))}
        />
      </Tooltip>
    </>
  );
};

export default PipelineBars;
