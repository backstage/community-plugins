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
import { ComputedStatus, TerminatedReasons } from '@janus-idp/shared-react';

import { StepStatus, TaskStatus, TaskStatusStep } from '../types/taskRun';
import { calculateDuration } from './tekton-utils';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../translations/index.ts';

const getMatchingStepDuration = (
  t: TranslationFunction<typeof tektonTranslationRef.T>,
  matchingStep?: TaskStatusStep,
) => {
  if (!matchingStep) return '';

  if (matchingStep.terminated) {
    return calculateDuration(
      t,
      matchingStep.terminated.startedAt,
      matchingStep.terminated.finishedAt,
    );
  }

  if (matchingStep.running) {
    return calculateDuration(t, matchingStep.running.startedAt);
  }

  return '';
};

const getMatchingStep = (
  step: { name: string },
  status: TaskStatus,
): TaskStatusStep | undefined => {
  const statusSteps: TaskStatusStep[] = status.steps || [];
  return statusSteps.find(statusStep => {
    // In rare occasions the status step name is prefixed with `step-`
    // This is likely a bug but this workaround will be temporary as it's investigated separately
    return (
      statusStep.name === step.name || statusStep.name === `step-${step.name}`
    );
  });
};

export const createStepStatus = (
  step: { name: string },
  status: TaskStatus,
  t: TranslationFunction<typeof tektonTranslationRef.T>,
): StepStatus => {
  let stepRunStatus = ComputedStatus.PipelineNotStarted;
  let duration = null;

  if (!status?.reason) {
    stepRunStatus = ComputedStatus.Cancelled;
  } else if (status.reason === ComputedStatus['In Progress']) {
    // In progress, try to get granular statuses
    const matchingStep = getMatchingStep(step, status);

    if (!matchingStep) {
      stepRunStatus = ComputedStatus.Pending;
    } else if (matchingStep.terminated) {
      stepRunStatus =
        matchingStep.terminated.reason === TerminatedReasons.Completed
          ? ComputedStatus.Succeeded
          : ComputedStatus.Failed;
      duration = getMatchingStepDuration(t, matchingStep);
    } else if (matchingStep.running) {
      stepRunStatus = ComputedStatus['In Progress'];
      duration = getMatchingStepDuration(t, matchingStep);
    } else if (matchingStep.waiting) {
      stepRunStatus = ComputedStatus.Pending;
    }
  } else {
    // Not in progress, just use the run status reason
    stepRunStatus = status.reason;

    duration =
      getMatchingStepDuration(t, getMatchingStep(step, status)) ||
      status.duration;
  }

  return {
    duration,
    name: step.name,
    status: stepRunStatus as any,
  };
};
