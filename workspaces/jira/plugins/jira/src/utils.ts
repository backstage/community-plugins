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

import { AxiosError } from 'axios';
import { Issue } from './types';

/**
 * @public
 */
export const handleError = (error: AxiosError<{ errorMessages: string[] }>) =>
  Promise.reject(
    new Error(
      (error?.response?.data?.errorMessages &&
        error.response.data.errorMessages[0].toString()) ||
        error?.message ||
        error?.request ||
        error.toString(),
    ),
  );

enum StatusType {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  BLOCKED = 'Blocked',
}

/**
 * @public
 */
export const jiraStatusColor = {
  done: '#32CD32',
  toDo: '#ffffff',
  inProgress: '#FFD700',
  blocked: '#FF0000',
};

/**
 * @public
 */
export const jiraStatusProgress = {
  done: 1.0,
  toDo: 0.0,
  inProgress: 0.5,
  blocked: 1.0,
};

/**
 * @public
 */
export function extractBreakDownData(
  jiraEpic: string,
  issues: Issue[],
  filterMap: Map<string, string[]>,
): Map<string, Issue[]> {
  const issuesBreakdowns = new Map<string, Issue[]>();

  const processEntity = (entity: Issue) => {
    for (const [filterName, filterValues] of filterMap.entries()) {
      const matchedLabels = entity.labels.filter(label =>
        filterValues.includes(label),
      );

      if (matchedLabels.length > 0) {
        if (!issuesBreakdowns.has(filterName)) {
          issuesBreakdowns.set(filterName, []);
        }
        issuesBreakdowns.get(filterName)?.push(entity);
      }
    }
  };

  for (const issue of issues) {
    if (issue.key === jiraEpic) continue;
    processEntity(issue);
    if (issue.subtasks) {
      for (const subtask of issue.subtasks) {
        processEntity(subtask);
      }
    }
  }

  return issuesBreakdowns;
}

/**
 * @public
 */
export const extractEpicSummary = (
  issues: Issue[],
  epicKey: string,
): string | undefined => {
  return issues.find(issue => issue.key === epicKey)?.summary;
};

/**
 * @public
 */
export const countStatuses = (
  statuses: string[],
  jiraBreakdownTodoStatus: string,
  jiraBreakdownInProgressStatus: string,
  jiraBreakdownBlockStatus: string,
  jiraBreakdownDoneStatus: string,
): Map<string, number> => {
  const counts = new Map<string, number>();
  statuses.forEach(originalStatus => {
    let status = originalStatus;
    if (jiraBreakdownTodoStatus.includes(status)) status = StatusType.TODO;
    if (jiraBreakdownInProgressStatus.includes(status))
      status = StatusType.IN_PROGRESS;
    if (jiraBreakdownBlockStatus.includes(status)) status = StatusType.BLOCKED;
    if (jiraBreakdownDoneStatus.includes(status)) status = StatusType.DONE;

    counts.set(status, (counts.get(status) || 0) + 1);
  });
  return counts;
};

const isBlocked = (counts: Map<string, number>) =>
  (counts.get(StatusType.BLOCKED) || 0) > 0;

const isAllDone = (counts: Map<string, number>, total: number) =>
  (counts.get(StatusType.DONE) || 0) === total;

const isAllToDo = (counts: Map<string, number>, total: number) =>
  (counts.get(StatusType.TODO) || 0) === total;

const isInProgress = (counts: Map<string, number>) => {
  const doneCount = counts.get(StatusType.DONE) || 0;
  const toDoCount = counts.get(StatusType.TODO) || 0;
  const inProgressCount = counts.get(StatusType.IN_PROGRESS) || 0;

  // If there's at least one "In Progress" or "Testing", return true
  if (inProgressCount > 0) {
    return true;
  }

  // Check if there are any "Done" tasks and at least one "To Do"
  if (doneCount > 0 && toDoCount > 0) {
    return true;
  }

  return false;
};

/**
 * @public
 */
export const getStatusAndProgress = (
  counts: Map<string, number>,
  total: number,
) => {
  const colorValues = jiraStatusColor;
  const progressValues = jiraStatusProgress;
  if (isBlocked(counts)) {
    return {
      status: StatusType.BLOCKED,
      color: colorValues.blocked,
      progress: progressValues.blocked,
    };
  }
  if (isAllDone(counts, total)) {
    return {
      status: StatusType.DONE,
      color: colorValues.done,
      progress: progressValues.done,
    };
  }
  if (isAllToDo(counts, total)) {
    return {
      status: StatusType.TODO,
      color: colorValues.toDo,
      progress: progressValues.toDo,
    };
  }
  if (isInProgress(counts)) {
    return {
      status: StatusType.IN_PROGRESS,
      color: colorValues.inProgress,
      progress: progressValues.inProgress,
    };
  }
  return {
    status: '',
    color: '',
    progress: 0,
  };
};

/**
 * @public
 */
export const extractLabelProgress = (
  issuesBreakdowns: Map<string, Issue[]> | undefined,
  jiraBreakdownTodoStatus: string,
  jiraBreakdownInProgressStatus: string,
  jiraBreakdownBlockStatus: string,
  jiraBreakdownDoneStatus: string,
) => {
  if (!issuesBreakdowns) return [];
  const specificProgress: {
    label: string;
    status: string;
    color: string;
    progress: number;
  }[] = [];

  issuesBreakdowns.forEach((issues, label) => {
    const statuses = issues.map(issue => issue.status.name);
    const counts = countStatuses(
      statuses,
      jiraBreakdownTodoStatus,
      jiraBreakdownInProgressStatus,
      jiraBreakdownBlockStatus,
      jiraBreakdownDoneStatus,
    );
    const total = statuses.length;

    const { status, color, progress } = getStatusAndProgress(counts, total);

    if (status && color && progress !== null) {
      specificProgress.push({
        label,
        status,
        color,
        progress,
      });
    }
  });

  return specificProgress;
};
