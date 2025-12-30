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

/**
 * The reasons for the terminated status.
 *
 * @public
 */
export enum TerminatedReasons {
  /** Task has been completed */
  Completed = 'Completed',
}

/**
 * The computed status of a task.
 *
 * @public
 */
export enum ComputedStatus {
  /** All statuses */
  All = 'All',
  /** Task is being cancelled */
  Cancelling = 'Cancelling',
  /** Task has succeeded */
  Succeeded = 'Succeeded',
  /** Task has failed */
  Failed = 'Failed',
  /** Task is running */
  Running = 'Running',
  /** Task is in progress */
  'In Progress' = 'In Progress',
  /** Task failed to start */
  FailedToStart = 'FailedToStart',
  /** Task is not started */
  PipelineNotStarted = 'PipelineNotStarted',
  /** Task has been skipped */
  Skipped = 'Skipped',
  /** Task has been cancelled */
  Cancelled = 'Cancelled',
  /** Task is pending */
  Pending = 'Pending',
  /** Task is idle */
  Idle = 'Idle',
  /** Task is other */
  Other = 'Other',
}

/**
 * The reasons for the succeed condition.
 *
 * @public
 */
export enum SucceedConditionReason {
  /** Pipeline run has been cancelled */
  PipelineRunCancelled = 'StoppedRunFinally',
  /** Pipeline run has been stopped */
  PipelineRunStopped = 'CancelledRunFinally',
  /** Task run has been cancelled */
  TaskRunCancelled = 'TaskRunCancelled',
  /** Task has been cancelled */
  Cancelled = 'Cancelled',
  /** Pipeline run is stopping */
  PipelineRunStopping = 'PipelineRunStopping',
  /** Pipeline run is pending */
  PipelineRunPending = 'PipelineRunPending',
  /** Task run is stopping */
  TaskRunStopping = 'TaskRunStopping',
  /** Task run has been created container config error */
  CreateContainerConfigError = 'CreateContainerConfigError',
  /** Task run has exceeded node resources */
  ExceededNodeResources = 'ExceededNodeResources',
  /** Task run has exceeded resource quota */
  ExceededResourceQuota = 'ExceededResourceQuota',
  /** Task run has been condition check failed */
  ConditionCheckFailed = 'ConditionCheckFailed',
}

/**
 * The message for the status.
 *
 * @public
 */
export type StatusMessage = {
  message: string;
  color: string;
};

/**
 * The task status types.
 *
 * @public
 */
export type TaskStatusTypes = {
  PipelineNotStarted: number;
  Pending: number;
  Running: number;
  Succeeded: number;
  Cancelled: number;
  Failed: number;
  Skipped: number;
};
