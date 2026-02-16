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

import { PipelineRunKind, TaskRunKind } from '../../types';

/**
 * The function to get the task runs for the pipeline run.
 *
 * @public
 */
export const getTaskRunsForPipelineRun = (
  pipelinerun: PipelineRunKind | null,
  taskRuns: TaskRunKind[],
): TaskRunKind[] => {
  if (!taskRuns || taskRuns.length === 0) {
    return [];
  }
  const associatedTaskRuns = taskRuns.reduce(
    (acc: TaskRunKind[], taskRun: TaskRunKind) => {
      if (
        taskRun?.metadata?.ownerReferences?.[0]?.name ===
        pipelinerun?.metadata?.name
      ) {
        acc.push(taskRun);
      }
      return acc;
    },
    [],
  );

  return associatedTaskRuns;
};
