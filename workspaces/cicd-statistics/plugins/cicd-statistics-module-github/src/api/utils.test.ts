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

import { RestEndpointMethodTypes } from '@octokit/rest';
import { workflowToBuild, jobToStages } from './utils';

type Workflow =
  RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']['workflow_runs'][0];
type Job =
  RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data']['jobs'][0];

const workflowMock: Workflow = {
  id: 1000,
  head_sha: 'd40',
  head_branch: 'main',
  status: 'completed',
  conclusion: 'success',
  event: 'schedule',
  created_at: '2022-03-30T13:03:09.846Z',
  updated_at: '2022-03-30T13:07:49.248Z',
} as Workflow;

const jobMock: Job = {
  id: 6962883,
  conclusion: 'success',
  status: 'completed',
  name: 'build',
  started_at: '2022-03-30T08:35:16.532Z',
  completed_at: '2022-03-30T08:35:37.731Z',
  steps: [
    {
      name: 'docker',
      status: 'completed',
      conclusion: 'success',
      number: 1,
      started_at: '2022-03-30T08:35:16.532Z',
      completed_at: '2022-03-30T08:35:37.731Z',
    },
  ],
} as Job;

describe('util functionality', () => {
  it('transforms the pipeline object to the build object', () => {
    const builds = workflowToBuild(workflowMock);
    expect(builds).toEqual({
      id: '1000',
      status: 'succeeded',
      branchType: 'master',
      duration: 0,
      requestedAt: new Date('2022-03-30T13:03:09.846Z'),
      triggeredBy: 'internal',
      stages: [],
    });
  });

  it('transforms the job object to the stage object', () => {
    const stages = jobToStages(jobMock);
    expect(stages).toEqual({
      name: 'build',
      status: 'succeeded',
      duration: 21199,
      stages: [
        {
          name: 'docker',
          status: 'succeeded',
          duration: 21199,
        },
      ],
    });
  });
});
