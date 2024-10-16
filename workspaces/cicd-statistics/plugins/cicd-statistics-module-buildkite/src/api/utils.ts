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
  Build,
  FilterStatusType,
  FilterBranchType,
  TriggerReason,
  Stage,
} from '@backstage-community/plugin-cicd-statistics';
import { BuildkiteBuild, Job } from './types';

/*
 * See https://buildkite.com/docs/pipelines/defining-steps#build-states
 */
export const buildStatusMap: Record<string, FilterStatusType> = {
  running: 'running',
  scheduled: 'scheduled',
  passed: 'succeeded',
  failing: 'failed',
  failed: 'failed',
  blocked: 'stalled',
  canceled: 'aborted',
  canceling: 'aborted',
  skipped: 'aborted',
  not_run: 'scheduled',
  finished: 'unknown',
};

/*
 * See https://buildkite.com/docs/pipelines/defining-steps#job-states
 */
const jobStatusMap: Record<string, FilterStatusType> = {
  accepted: 'scheduled',
  assigned: 'scheduled',
  blocked: 'stalled',
  blocked_failed: 'failed',
  broken: 'failed',
  canceled: 'aborted',
  canceling: 'aborted',
  expired: 'aborted',
  finished: 'unknown',
  limited: 'unknown',
  limiting: 'unknown',
  pending: 'stalled',
  running: 'running',
  scheduled: 'scheduled',
  skipped: 'aborted',
  timed_out: 'expired',
  timing_out: 'expired',
  unblocked: 'unknown',
  unblocked_failed: 'failed',
  waiting: 'scheduled',
  waiting_failed: 'failed',
};

/**
 * toBuilds transforms build objects from Buildkite to Build objects.
 *
 * @param builds - array of build objects returned from Buildkite's API.
 *
 * @public
 */
export function toBuilds(builds: BuildkiteBuild[]): Build[] {
  return builds.map(build => {
    return {
      id: build.id,
      status: buildStatusMap[build.state],
      // TODO: is this correct?
      branchType: build.branch as FilterBranchType,
      duration:
        new Date(build.finished_at).valueOf() -
        new Date(build.started_at).valueOf(),
      requestedAt: new Date(build.created_at),
      triggeredBy: triggeredBy(build.source),
      stages: jobsToStages(build.jobs),
    };
  });
}

export function triggeredBy(source: string): TriggerReason {
  if (source === 'schedule') {
    return 'internal';
  }

  if (source === 'ui') {
    return 'manual';
  }

  return 'scm';
}

/**
 * jobsToStages transforms Job objects from Buildkite to Stage objects.
 *
 * @param jobs - array of job objects returned from the Buildkite API.
 *
 * @public
 */
export function jobsToStages(jobs: Job[]): Stage[] {
  return jobs.map(job => {
    const status = jobStatusMap[job.state]
      ? jobStatusMap[job.state]
      : 'unknown';
    const duration =
      new Date(job.finished_at).valueOf() - new Date(job.started_at).valueOf();

    return {
      name: job.name,
      status,
      duration,
      stages: [
        {
          name: job.name,
          status,
          duration,
        },
      ],
    };
  });
}
