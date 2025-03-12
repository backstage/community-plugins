/*
 * Copyright 2022 The Backstage Authors
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
  Build,
  FilterStatusType,
  TriggerReason,
  Stage,
} from '@backstage-community/plugin-cicd-statistics';

import { RestEndpointMethodTypes } from '@octokit/rest';

// "unknown" | "enqueued" | "scheduled" | "running" | "aborted" | "succeeded" | "failed" | "stalled" | "expired"
//
const statusMap: Record<string, FilterStatusType> = {
  // completed, action_required, cancelled, failure, neutral, skipped, stale, success, timed_out, in_progress, queued, requested, waiting, pending

  completed: 'succeeded',
  action_required: 'running',
  cancelled: 'aborted',
  failure: 'failed',
  neutral: 'unknown',
  skipped: 'aborted',
  stale: 'stalled',
  success: 'succeeded',
  timed_out: 'expired',
  in_progress: 'running',
  queued: 'enqueued',
  requested: 'scheduled',
  waiting: 'running',
  pending: 'running',
};

// all gitlab trigger reasons can be found here: https://docs.gitlab.com/ee/api/workflows.html#list-project-workflows
const triggerReasonMap: Record<string, TriggerReason> = {
  push: 'scm',
  workflow_dispatch: 'manual',
  pull_request: 'scm',
  schedule: 'internal',
  deployment: 'scm',
  dynamic: 'internal',
};

/**
 * Takes the Pipeline object from Gitlab and transforms it to the Build object
 *
 * @param workflows - Pipeline object that gets returned from Gitlab
 *
 * @public
 */
export function workflowToBuild(
  workflow: RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']['workflow_runs'][0],
): Build {
  return {
    id: workflow.id.toString(),
    status: statusMap[workflow.conclusion ?? ''] ?? 'unknown',
    branchType: ['main', 'master'].includes(workflow.head_branch ?? '')
      ? 'master'
      : 'branch',
    duration: 0, // will get filled in later in a seperate API call
    requestedAt: new Date(workflow.created_at),
    triggeredBy: triggerReasonMap[workflow.event] ?? 'other',
    stages: [],
  };
}

/**
 * Takes the Job object from Gitlab and transforms it to the Stage object
 *
 * @param jobs - Job object that gets returned from Gitlab
 *
 * @public
 *
 * @remarks
 *
 */
export function jobToStages(
  job: RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data']['jobs'][0],
): Stage {
  const status = statusMap[job.status] ? statusMap[job.status] : 'unknown';
  const duration =
    job.started_at && job.completed_at
      ? new Date(job.completed_at).getTime() -
        new Date(job.started_at).getTime()
      : 0;
  return {
    name: job.name,
    status,
    duration,
    stages: job.steps?.map(step => {
      return {
        name: step.name,
        status: statusMap[step.status] ?? 'unknown',
        duration:
          step.started_at && step.completed_at
            ? new Date(step.completed_at).getTime() -
              new Date(step.started_at).getTime()
            : 0,
      };
    }),
  };
}
