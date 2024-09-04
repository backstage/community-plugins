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

import { toBuilds, triggeredBy, jobsToStages } from './utils';
import { BuildkiteBuild } from './types';

const buildsMock: BuildkiteBuild[] = [
  {
    id: '1',
    branch: 'main',
    state: 'passed',
    created_at: '2022-03-30T13:03:09.846Z',
    started_at: '2022-03-30T13:03:09.846Z',
    finished_at: '2022-03-30T13:04:09.846Z',
    source: 'foo',
    jobs: [
      {
        name: 'job name',
        state: 'foo',
        started_at: '2015-05-09T21:07:59.874Z',
        finished_at: '2015-05-09T21:08:59.874Z',
      },
    ],
  },
];

describe('util', () => {
  describe('toBuilds', () => {
    it('transforms Buildkite build objects to build object', () => {
      const builds = toBuilds(buildsMock);

      expect(builds).toEqual([
        {
          id: '1',
          status: 'succeeded',
          branchType: 'main',
          duration: 60000,
          requestedAt: new Date('2022-03-30T13:03:09.846Z'),
          triggeredBy: 'scm',
          stages: [
            {
              name: 'job name',
              status: 'unknown',
              duration: 60000,
              stages: [
                {
                  name: 'job name',
                  status: 'unknown',
                  duration: 60000,
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('triggeredBy', () => {
    it('handles scheduled builds', () => {
      expect(triggeredBy('schedule')).toEqual('internal');
    });

    it('handles manually triggered builds', () => {
      expect(triggeredBy('ui')).toEqual('manual');
    });

    it('handles builds triggered via other sources', () => {
      expect(triggeredBy('foo')).toEqual('scm');
    });
  });

  describe('jobsToStages', () => {
    it('transforms job objects to stage objects', () => {
      const stages = jobsToStages(buildsMock[0].jobs);

      expect(stages).toEqual([
        {
          name: 'job name',
          status: 'unknown',
          duration: 60000,
          stages: [
            {
              name: 'job name',
              status: 'unknown',
              duration: 60000,
            },
          ],
        },
      ]);
    });
  });
});
