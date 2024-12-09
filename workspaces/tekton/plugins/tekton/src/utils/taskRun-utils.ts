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
  TaskRunResultsAnnotations,
  TaskRunResultsKeyValue,
  TaskRunResultsTypeValue,
} from '@aonic-ui/pipelines';

import {
  ComputedStatus,
  pipelineRunFilterReducer,
  TaskRunKind,
} from '@janus-idp/shared-react';

import {
  TEKTON_PIPELINE_RUN,
  TEKTON_PIPELINE_TASK,
} from '../consts/tekton-const';
import { OutputTaskRunGroup } from '../types/output';

export type TaskStep = {
  id: string;
  name: string;
  status: ComputedStatus;
  startedAt?: string;
  endedAt?: string;
};

export const getSortedTaskRuns = (tRuns: TaskRunKind[]): TaskStep[] => {
  if (!tRuns || tRuns.length === 0) {
    return [];
  }
  const taskRuns = Array.from(tRuns).sort((a, b) => {
    if (a.status?.completionTime) {
      return b.status?.completionTime &&
        new Date(a.status?.completionTime ?? '') >
          new Date(b.status.completionTime)
        ? 1
        : -1;
    }
    return b.status?.completionTime ||
      new Date(a.status?.startTime ?? '') > new Date(b.status?.startTime ?? '')
      ? 1
      : -1;
  });
  return (taskRuns?.map(tr => {
    return {
      id: tr.metadata?.name,
      name: tr.metadata?.labels?.[TEKTON_PIPELINE_TASK],
      status: pipelineRunFilterReducer(tr),
      startedAt: tr.status?.startTime,
      endedAt: tr.status?.completionTime,
    };
  }) || []) as TaskStep[];
};

export const getActiveTaskRun = (
  taskRuns: TaskStep[],
  activeTask: string | undefined,
): string | undefined =>
  activeTask
    ? taskRuns.find(taskRun => taskRun?.id === activeTask)?.id
    : taskRuns[taskRuns.length - 1]?.id;

const checkTypeAnnotation = (
  tr: TaskRunKind | undefined,
  type: TaskRunResultsTypeValue,
): boolean =>
  tr?.metadata?.annotations?.[TaskRunResultsAnnotations.TYPE] === type;

export const isSbomTaskRun = (tr: TaskRunKind | undefined): boolean =>
  tr?.metadata?.annotations?.[TaskRunResultsAnnotations.KEY] ===
  TaskRunResultsKeyValue.SBOM;

export const isECTaskRun = (tr: TaskRunKind | undefined): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.EC);

export const isACSImageScanTaskRun = (tr: TaskRunKind | undefined): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.ROXCTL_IMAGE_SCAN);

export const isACSImageCheckTaskRun = (tr: TaskRunKind | undefined): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.ROXCTL_IMAGE_CHECK);

export const isACSDeploymentCheckTaskRun = (
  tr: TaskRunKind | undefined,
): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.ROXCTL_DEPLOYMENT_CHECK);

export const getTaskrunsOutputGroup = (
  pipelineRunName: string | undefined,
  taskruns: TaskRunKind[],
): OutputTaskRunGroup => {
  const getPLRTaskRunByType = (
    check: (tr: TaskRunKind | undefined) => boolean,
  ): TaskRunKind | undefined =>
    taskruns?.find(
      (tr: TaskRunKind) =>
        tr?.metadata?.labels?.[TEKTON_PIPELINE_RUN] === pipelineRunName &&
        check(tr),
    );

  return {
    sbomTaskRun: getPLRTaskRunByType(isSbomTaskRun),
    ecTaskRun: getPLRTaskRunByType(isECTaskRun),
    acsImageScanTaskRun: getPLRTaskRunByType(isACSImageScanTaskRun),
    acsImageCheckTaskRun: getPLRTaskRunByType(isACSImageCheckTaskRun),
    acsDeploymentCheckTaskRun: getPLRTaskRunByType(isACSDeploymentCheckTaskRun),
  };
};

export const hasExternalLink = (
  sbomTaskRun: TaskRunKind | undefined,
): boolean =>
  sbomTaskRun?.metadata?.annotations?.[TaskRunResultsAnnotations.TYPE] ===
  TaskRunResultsTypeValue.EXTERNAL_LINK;

export const getSbomLink = (
  sbomTaskRun: TaskRunKind | undefined,
): string | undefined =>
  (sbomTaskRun?.status?.results || sbomTaskRun?.status?.taskResults)?.find(
    r => r.name === TaskRunResultsKeyValue.SBOM,
  )?.value;
