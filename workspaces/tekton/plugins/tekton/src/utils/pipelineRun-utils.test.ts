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
import {
  ComputedStatus,
  SucceedConditionReason,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { appendPipelineRunStatus, getPLRTaskRuns } from './pipelineRun-utils';

describe('pipelineRun-utils', () => {
  it('should append Pending status if a taskrun status reason is missing', () => {
    const pipelineRun = mockKubernetesPlrResponse.pipelineruns[0];
    const pipelineRunWithoutStatus = { ...pipelineRun };
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      mockKubernetesPlrResponse.pipelineruns[0].metadata.name,
    );

    const taskList = appendPipelineRunStatus(
      pipelineRunWithoutStatus,
      plrTaskRuns,
    );
    expect(
      taskList.filter(t => t?.status.reason === ComputedStatus.Pending),
    ).toHaveLength(2);
  });

  it('should append pipelineRun running status for all the tasks', () => {
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      mockKubernetesPlrResponse.pipelineruns[0].metadata.name,
    );

    const taskList = appendPipelineRunStatus(
      mockKubernetesPlrResponse.pipelineruns[0],
      plrTaskRuns,
    );
    expect(
      taskList.filter(t => t.status.reason === ComputedStatus.Running),
    ).toHaveLength(1);
  });

  it('should append pipelineRun pending status for all the tasks if taskruns are not present and pipelinerun status is PipelineRunPending', () => {
    const pipelineRun = { ...mockKubernetesPlrResponse.pipelineruns[0] };
    pipelineRun.status.conditions[0] = {
      ...pipelineRun.status.conditions[0],
      reason: SucceedConditionReason.PipelineRunPending,
    };
    const taskList = appendPipelineRunStatus(pipelineRun, {});
    expect(
      taskList.filter(t => t.status.reason === ComputedStatus.Idle),
    ).toHaveLength(pipelineRun.status.pipelineSpec.tasks.length);
  });

  it('should append pipelineRun cancelled status for all the tasks if taskruns are not present and pipelinerun status is PipelineRunCancelled', () => {
    const pipelineRun = { ...mockKubernetesPlrResponse.pipelineruns[0] };
    pipelineRun.status.conditions[0] = {
      ...pipelineRun.status.conditions[0],
      reason: SucceedConditionReason.PipelineRunCancelled,
    };
    const taskList = appendPipelineRunStatus(pipelineRun, {});
    expect(
      taskList.filter(t => t.status.reason === ComputedStatus.Cancelled),
    ).toHaveLength(pipelineRun.status.pipelineSpec.tasks.length);
  });

  it('should append status to only pipeline tasks if isFinallyTasks is false', () => {
    const pipelineRun = { ...mockKubernetesPlrResponse.pipelineruns[1] };
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      pipelineRun.metadata.name,
    );
    const taskList = appendPipelineRunStatus(pipelineRun, plrTaskRuns);
    expect(taskList).toHaveLength(3);
  });

  it('should append status to only finally tasks if isFinallyTasks is true', () => {
    const pipelineRun = { ...mockKubernetesPlrResponse.pipelineruns[1] };
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      pipelineRun.metadata.name,
    );
    const taskList = appendPipelineRunStatus(pipelineRun, plrTaskRuns, true);
    expect(taskList).toHaveLength(1);
  });

  it('should return empty array if there are no finally tasks but isFinallyTasks is true', () => {
    const pipelineRun = { ...mockKubernetesPlrResponse.pipelineruns[0] };
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns as TaskRunKind[],
      pipelineRun.metadata.name,
    );
    const taskList = appendPipelineRunStatus(pipelineRun, plrTaskRuns, true);
    expect(taskList).toHaveLength(0);
  });
});
