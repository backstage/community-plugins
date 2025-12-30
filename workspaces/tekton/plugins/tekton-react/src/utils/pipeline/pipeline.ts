/*
 * Copyright 2025 The Backstage Authors
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

import {
  successColor,
  failureColor,
  runningColor,
  skippedColor,
  cancelledColor,
  pendingColor,
} from '../../constants';
import {
  ComputedStatus,
  PipelineRunKind,
  PipelineTaskWithStatus,
  StatusMessage,
  SucceedConditionReason,
  TaskRunKind,
  TaskStatusTypes,
} from '../../types';
import { getTaskRunsForPipelineRun } from './task-run';

/**
 * The function to get the status color for the run.
 *
 * @public
 */
export const getRunStatusColor = (status: string): StatusMessage => {
  switch (status) {
    case ComputedStatus.Succeeded:
      return { message: 'Succeeded', color: successColor };
    case ComputedStatus.Failed:
      return { message: 'Failed', color: failureColor };
    case ComputedStatus.FailedToStart:
      return {
        message: 'PipelineRun failed to start',
        color: failureColor,
      };
    case ComputedStatus.Running:
    case ComputedStatus['In Progress']:
      return { message: 'Running', color: runningColor };

    case ComputedStatus.Skipped:
      return { message: 'Skipped', color: skippedColor };
    case ComputedStatus.Cancelled:
      return { message: 'Cancelled', color: cancelledColor };
    case ComputedStatus.Cancelling:
      return { message: 'Cancelling', color: cancelledColor };
    case ComputedStatus.Idle:
    case ComputedStatus.Pending:
      return { message: 'Pending', color: pendingColor };
    default:
      return {
        message: 'PipelineRun not started yet',
        color: pendingColor,
      };
  }
};

const getSucceededStatus = (status: string): ComputedStatus => {
  if (status === 'True') {
    return ComputedStatus.Succeeded;
  } else if (status === 'False') {
    return ComputedStatus.Failed;
  }
  return ComputedStatus.Running;
};

/**
 * The function to get the status for the pipeline run.
 *
 * @public
 */
export const pipelineRunStatus = (
  pipelineRun: PipelineRunKind | TaskRunKind | PipelineTaskWithStatus | null,
) => {
  const conditions = pipelineRun?.status?.conditions || [];
  if (conditions.length === 0) return null;

  const succeedCondition = conditions.find((c: any) => c.type === 'Succeeded');
  const cancelledCondition = conditions.find(
    (c: any) => c.reason === 'Cancelled',
  );
  const failedCondition = conditions.find((c: any) => c.reason === 'Failed');

  if (
    [
      SucceedConditionReason.PipelineRunStopped,
      SucceedConditionReason.PipelineRunCancelled,
    ].includes(
      (pipelineRun as PipelineRunKind)?.spec?.status as SucceedConditionReason,
    ) &&
    !cancelledCondition &&
    !failedCondition
  ) {
    return ComputedStatus.Cancelling;
  }

  if (!succeedCondition?.status) {
    return null;
  }

  const status = getSucceededStatus(succeedCondition.status);

  if (succeedCondition.reason && succeedCondition.reason !== status) {
    switch (succeedCondition.reason) {
      case SucceedConditionReason.PipelineRunCancelled:
      case SucceedConditionReason.TaskRunCancelled:
      case SucceedConditionReason.Cancelled:
      case SucceedConditionReason.PipelineRunStopped:
        return ComputedStatus.Cancelled;
      case SucceedConditionReason.PipelineRunStopping:
      case SucceedConditionReason.TaskRunStopping:
        return ComputedStatus.Failed;
      case SucceedConditionReason.CreateContainerConfigError:
      case SucceedConditionReason.ExceededNodeResources:
      case SucceedConditionReason.ExceededResourceQuota:
      case SucceedConditionReason.PipelineRunPending:
        return ComputedStatus.Pending;
      case SucceedConditionReason.ConditionCheckFailed:
        return ComputedStatus.Skipped;
      default:
        return status;
    }
  }
  return status;
};

/**
 * The function to filter the pipeline run.
 *
 * @public
 */
export const pipelineRunFilterReducer = (
  pipelineRun: PipelineRunKind | TaskRunKind,
): ComputedStatus => {
  const status = pipelineRunStatus(pipelineRun);
  return status || ComputedStatus.Other;
};

/**
 * The function to update the task status.
 *
 * @public
 */
export const updateTaskStatus = (
  pipelinerun: PipelineRunKind | null,
  taskRuns: TaskRunKind[],
): TaskStatusTypes => {
  const skippedTaskLength = pipelinerun?.status?.skippedTasks?.length || 0;
  const PLRTaskRuns = getTaskRunsForPipelineRun(pipelinerun, taskRuns);
  const taskStatus: TaskStatusTypes = {
    PipelineNotStarted: 0,
    Pending: 0,
    Running: 0,
    Succeeded: 0,
    Failed: 0,
    Cancelled: 0,
    Skipped: skippedTaskLength,
  };

  if (!PLRTaskRuns || PLRTaskRuns.length === 0) {
    return taskStatus;
  }

  PLRTaskRuns.forEach((taskRun: TaskRunKind) => {
    const status = taskRun && pipelineRunFilterReducer(taskRun);
    if (status === 'Succeeded') {
      taskStatus[ComputedStatus.Succeeded]++;
    } else if (status === 'Running') {
      taskStatus[ComputedStatus.Running]++;
    } else if (status === 'Failed') {
      taskStatus[ComputedStatus.Failed]++;
    } else if (status === 'Cancelled') {
      taskStatus[ComputedStatus.Cancelled]++;
    } else {
      taskStatus[ComputedStatus.Pending]++;
    }
  });

  return {
    ...taskStatus,
  };
};
