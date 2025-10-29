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
  ClusterObjects,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';

import { get } from 'lodash';

import {
  ComputedStatus,
  getTaskRunsForPipelineRun,
  pipelineRunFilterReducer,
  PipelineRunKind,
  pipelineRunStatus,
  SucceedConditionReason,
  TaskRunKind,
  TaskStatusTypes,
  updateTaskStatus,
} from '@janus-idp/shared-react';

import { getPipelineRunScanResults } from '../hooks/usePipelineRunScanResults';
import { PipelineRunGVK, TaskRunGVK } from '../models';
import {
  ClusterErrors,
  Order,
  PipelineRunScanResults,
  TektonResponseData,
} from '../types/types';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../translations/index.ts';

export const getClusters = (k8sObjects: ObjectsByEntityResponse) => {
  const clusters: string[] = k8sObjects.items.map(
    (item: ClusterObjects) => item.cluster.name,
  );
  const errors: ClusterErrors[] = k8sObjects.items.map(
    (item: ClusterObjects) => item.errors,
  );
  return { clusters, errors };
};

const isTektonResource = (kind: string) =>
  [PipelineRunGVK.kind, TaskRunGVK.kind].includes(kind);

const getResourceType = (kind: string) => {
  switch (kind) {
    case PipelineRunGVK.kind:
      return 'pipelineruns';
    case TaskRunGVK.kind:
      return 'taskruns';
    default:
      return '';
  }
};

export const getTektonResources = (
  cluster: number,
  k8sObjects: ObjectsByEntityResponse,
) =>
  k8sObjects.items?.[cluster]?.resources?.reduce(
    (acc: TektonResponseData, res: any) => {
      if (res.type === 'pods') {
        return {
          ...acc,
          pods: { data: res.resources },
        };
      }
      if (
        res.type !== 'customresources' ||
        (res.type === 'customresources' && res.resources.length === 0)
      ) {
        return acc;
      }
      const customResKind = res.resources[0].kind;
      return {
        ...acc,
        ...(isTektonResource(customResKind) && {
          [getResourceType(customResKind)]: {
            data: res.resources,
          },
        }),
      };
    },
    {},
  );

export const totalPipelineRunTasks = (pipelinerun: PipelineRunKind): number => {
  if (!pipelinerun?.status?.pipelineSpec) {
    return 0;
  }
  const totalTasks = (pipelinerun.status.pipelineSpec?.tasks || []).length;
  const finallyTasks =
    (pipelinerun.status.pipelineSpec?.finally || []).length ?? 0;
  return totalTasks + finallyTasks;
};

export const getTaskStatusOfPLR = (
  pipelinerun: PipelineRunKind,
  taskRuns: TaskRunKind[],
) => {
  const totalTasks = totalPipelineRunTasks(pipelinerun);
  const plrTasks = getTaskRunsForPipelineRun(pipelinerun, taskRuns);
  const plrTaskLength = plrTasks?.length;
  const skippedTaskLength = pipelinerun?.status?.skippedTasks?.length || 0;

  const taskStatus: TaskStatusTypes = updateTaskStatus(pipelinerun, plrTasks);

  if (plrTasks?.length > 0) {
    const pipelineRunHasFailure = taskStatus[ComputedStatus.Failed] > 0;
    const pipelineRunIsCancelled =
      pipelineRunFilterReducer(pipelinerun) === ComputedStatus.Cancelled;
    const unhandledTasks =
      totalTasks >= plrTaskLength
        ? totalTasks - plrTaskLength - skippedTaskLength
        : totalTasks;

    if (pipelineRunHasFailure || pipelineRunIsCancelled) {
      taskStatus[ComputedStatus.Cancelled] += unhandledTasks;
    } else {
      taskStatus[ComputedStatus.Pending] += unhandledTasks;
    }
  } else if (
    pipelinerun?.status?.conditions?.[0]?.status === 'False' ||
    pipelinerun?.spec?.status === SucceedConditionReason.PipelineRunCancelled
  ) {
    taskStatus[ComputedStatus.Cancelled] = totalTasks;
  } else if (
    pipelinerun?.spec?.status === SucceedConditionReason.PipelineRunPending
  ) {
    taskStatus[ComputedStatus.Pending] += totalTasks;
  } else {
    taskStatus[ComputedStatus.PipelineNotStarted]++;
  }
  return taskStatus;
};

export const getDuration = (
  t: TranslationFunction<typeof tektonTranslationRef.T>,
  seconds: number,
  long?: boolean,
): string => {
  if (seconds === 0) {
    return t('pipelineRunDuration.lessThanSec');
  }
  let sec = Math.round(seconds);
  let min = 0;
  let hr = 0;
  let duration = '';
  if (sec >= 60) {
    min = Math.floor(sec / 60);
    sec %= 60;
  }
  if (min >= 60) {
    hr = Math.floor(min / 60);
    min %= 60;
  }
  if (hr > 0) {
    duration += long ? t('pipelineRunDuration.hour', { count: hr }) : `${hr}h`;
    duration += ' ';
  }
  if (min > 0) {
    duration += long
      ? t('pipelineRunDuration.minute', { count: min })
      : `${min}m`;
    duration += ' ';
  }
  if (sec > 0) {
    duration += long
      ? t('pipelineRunDuration.second', { count: sec })
      : `${sec}s`;
  }

  return duration.trim();
};

export const descendingComparator = (
  a: PipelineRunKind,
  b: PipelineRunKind,
  orderBy: string,
) => {
  if (get(b, orderBy) < get(a, orderBy)) {
    return -1;
  }
  if (get(b, orderBy) > get(a, orderBy)) {
    return 1;
  }
  return 0;
};

export const calculateDurationInSeconds = (
  startTime: string,
  endTime?: string,
) => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
  const durationInSeconds = (end - start) / 1000;
  return durationInSeconds;
};

export const durationComparator = (a: PipelineRunKind, b: PipelineRunKind) => {
  const durationA = a.status?.startTime
    ? calculateDurationInSeconds(a.status?.startTime, a.status?.completionTime)
    : 0;

  const durationB = b.status?.startTime
    ? calculateDurationInSeconds(b.status?.startTime, b.status?.completionTime)
    : 0;

  if (durationB < durationA) {
    return -1;
  }
  if (durationB > durationA) {
    return 1;
  }
  return 0;
};

const vulnerabilitiesSortValue = (
  scanResults: PipelineRunScanResults,
): number => {
  if (!scanResults?.vulnerabilities) {
    return -1;
  }
  // Expect no more than 999 of any one severity
  return (
    (scanResults.vulnerabilities.critical ?? 0) * 1000000000 +
    (scanResults.vulnerabilities.high ?? 0) * 1000000 +
    (scanResults.vulnerabilities.medium ?? 0) * 1000 +
    (scanResults.vulnerabilities.low ?? 0)
  );
};

export const vulnerabilitiesComparator = (
  a: PipelineRunKind,
  b: PipelineRunKind,
) => {
  const vulnerabilitiesSortValueA = vulnerabilitiesSortValue(
    getPipelineRunScanResults(a),
  );
  const vulnerabilitiesSortValueB = vulnerabilitiesSortValue(
    getPipelineRunScanResults(b),
  );

  if (vulnerabilitiesSortValueB < vulnerabilitiesSortValueA) {
    return -1;
  }
  if (vulnerabilitiesSortValueB > vulnerabilitiesSortValueA) {
    return 1;
  }
  return 0;
};

export const getComparator = (
  order: Order,
  orderBy: string,
  orderById: string,
) => {
  switch (orderById) {
    case 'duration':
      return (a: PipelineRunKind, b: PipelineRunKind) => {
        return order === 'desc'
          ? durationComparator(a, b)
          : -durationComparator(a, b);
      };
    case 'vulnerabilities':
      return (a: PipelineRunKind, b: PipelineRunKind) => {
        return order === 'desc'
          ? vulnerabilitiesComparator(a, b)
          : -vulnerabilitiesComparator(a, b);
      };
    default:
      return (a: PipelineRunKind, b: PipelineRunKind) => {
        return order === 'desc'
          ? descendingComparator(a, b, orderBy)
          : -descendingComparator(a, b, orderBy);
      };
  }
};

export const calculateDuration = (
  t: TranslationFunction<typeof tektonTranslationRef.T>,
  startTime: string,
  endTime?: string,
  long?: boolean,
) => {
  const durationInSeconds = calculateDurationInSeconds(startTime, endTime);
  return getDuration(t, durationInSeconds, long);
};

export const pipelineRunDuration = (
  run: PipelineRunKind,
  t: TranslationFunction<typeof tektonTranslationRef.T>,
): string => {
  if (!run || Object.keys(run).length === 0) {
    return '-';
  }
  const startTime = run.status?.startTime;
  const completionTime = run.status?.completionTime;

  // Duration cannot be computed if start time is missing or a completed/failed pipeline/task has no end time
  if (!startTime || (!completionTime && pipelineRunStatus(run) !== 'Running')) {
    return '-';
  }
  return calculateDuration(t, startTime, completionTime, true);
};
