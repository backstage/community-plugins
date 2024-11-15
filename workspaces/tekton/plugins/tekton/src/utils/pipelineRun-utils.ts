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
import { cloneDeep, each, find, get, isEmpty, isFinite, trim } from 'lodash';

import {
  ComputedStatus,
  pipelineRunFilterReducer,
  PipelineRunKind,
  pipelineRunStatus,
  PipelineTask,
  PipelineTaskWithStatus,
  PLRTaskRuns,
  SucceedConditionReason,
  TaskRunKind,
} from '@janus-idp/shared-react';

import {
  TEKTON_PIPELINE_RUN,
  TEKTON_PIPELINE_TASK,
} from '../consts/tekton-const';
import { TaskStatus } from '../types/taskRun';

// Conversions between units and milliseconds
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const units = { w, d, h, m, s };

export const formatPrometheusDuration = (ms: number) => {
  if (!isFinite(ms) || ms < 0) {
    return '';
  }
  let remaining = ms;
  let str = '';
  each(units, (factor, unit) => {
    const n = Math.floor(remaining / factor);
    if (n > 0) {
      str += `${n}${unit} `;
      remaining -= n * factor;
    }
  });
  return trim(str);
};

export const taskConditions = {
  hasFromDependency: (task: PipelineTask): boolean =>
    !!task?.resources?.inputs?.[0].from,
  hasRunAfterDependency: (task: PipelineTask): boolean =>
    !!task?.runAfter && task?.runAfter?.length > 0,
};

export const getPipelineRun = (
  runs: PipelineRunKind[],
  name: string,
): PipelineRunKind | null => {
  if (runs?.length > 0 && name) {
    return runs.find(run => run?.metadata?.name === name) ?? null;
  }
  return null;
};

const getStatusReason = (reason: string | undefined) => {
  switch (reason) {
    case SucceedConditionReason.PipelineRunCancelled:
      return ComputedStatus.Cancelled;
    case SucceedConditionReason.PipelineRunPending:
      return ComputedStatus.Idle;
    default:
      return ComputedStatus.Failed;
  }
};

const appendTaskDuration = (mTask: PipelineTaskWithStatus) => {
  const task = cloneDeep(mTask);
  if (mTask?.status?.completionTime && mTask?.status?.startTime) {
    const date =
      new Date(mTask.status.completionTime).getTime() -
      new Date(mTask.status.startTime).getTime();
    task.status = {
      ...mTask.status,
      duration: formatPrometheusDuration(date),
    };
  }
  return task;
};

const appendTaskStatus = (mTask: PipelineTaskWithStatus) => {
  let task = cloneDeep(mTask);
  if (!mTask.status) {
    task = {
      ...mTask,
      status: { reason: ComputedStatus.Pending, conditions: [] },
    };
  } else if (mTask.status?.conditions) {
    task.status.reason = pipelineRunStatus(mTask) || ComputedStatus.Pending;
  } else if (mTask.status && !mTask.status.reason) {
    task.status.reason = ComputedStatus.Pending;
  }
  return task;
};

export const appendPipelineRunStatus = (
  pipelineRun: PipelineRunKind,
  taskRuns: PLRTaskRuns,
  isFinallyTasks = false,
) => {
  const tasks =
    (isFinallyTasks
      ? pipelineRun.status?.pipelineSpec?.finally
      : pipelineRun.status?.pipelineSpec?.tasks) || [];

  return tasks?.map(task => {
    if (!pipelineRun.status) {
      return task as PipelineTaskWithStatus;
    }
    if (isEmpty(taskRuns)) {
      return {
        ...task,
        status: {
          reason: getStatusReason(pipelineRun?.status?.conditions?.[0].reason),
        },
      } as PipelineTaskWithStatus;
    }
    let mTask = {
      ...task,
      status: get(find(taskRuns, { pipelineTaskName: task.name }), 'status'),
    } as PipelineTaskWithStatus;
    // append task duration
    mTask = appendTaskDuration(mTask);
    // append task status
    mTask = appendTaskStatus(mTask);
    return mTask;
  });
};

export const getPLRTaskRuns = (
  taskRuns: TaskRunKind[],
  pipelineRun: string | undefined,
): PLRTaskRuns => {
  const filteredTaskRuns = taskRuns.filter(
    tr => tr?.metadata?.labels?.[TEKTON_PIPELINE_RUN] === pipelineRun,
  );
  return filteredTaskRuns.reduce((acc: any, taskRun: TaskRunKind) => {
    const temp = {
      [`${taskRun?.metadata?.name}`]: {
        pipelineTaskName: taskRun?.metadata?.labels?.[TEKTON_PIPELINE_TASK],
        status: taskRun?.status,
      },
    };
    // eslint-disable-next-line no-param-reassign
    acc = { ...acc, ...temp };
    return acc;
  }, {});
};

export const getTaskStatus = (
  pipelineRun: PipelineRunKind,
  task: PipelineTaskWithStatus,
) => {
  let taskStatus: TaskStatus = {
    reason: ComputedStatus.Idle,
  };

  const computedStatus = pipelineRunFilterReducer(pipelineRun);
  const isSkipped = !!(
    task &&
    pipelineRun?.status?.skippedTasks?.some(
      (t: { name: string }) => t.name === task.name,
    )
  );

  if (task?.status) {
    taskStatus = task.status as TaskStatus;
  }
  if (
    computedStatus === ComputedStatus.Failed ||
    computedStatus === ComputedStatus.Cancelled
  ) {
    if (
      task?.status?.reason === ComputedStatus.Idle ||
      task?.status?.reason === ComputedStatus.Pending
    ) {
      taskStatus.reason = ComputedStatus.Cancelled;
    }
  }
  if (isSkipped) {
    taskStatus.reason = ComputedStatus.Skipped;
  }
  return taskStatus;
};
