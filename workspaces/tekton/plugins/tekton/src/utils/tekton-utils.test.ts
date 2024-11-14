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
import { RawFetchError } from '@backstage/plugin-kubernetes-common';

import { PipelineRunKind, PipelineRunStatus } from '@janus-idp/shared-react';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { kubernetesObjects } from '../__fixtures__/kubernetesObject';
import {
  calculateDuration,
  calculateDurationInSeconds,
  getClusters,
  getComparator,
  getDuration,
  getTaskStatusOfPLR,
  getTektonResources,
  pipelineRunDuration,
  totalPipelineRunTasks,
} from './tekton-utils';

describe('tekton-utils', () => {
  it('getClusters should return the cluster', () => {
    const k8sObjects = {
      items: [
        {
          cluster: {
            name: 'cluster1',
          },
          podMetrics: [],
          errors: [
            {
              errorType: 'FETCH_ERROR',
              message: 'Could not fetch resources',
            } as RawFetchError,
          ],
          resources: [],
        },
      ],
    };
    const { clusters, errors } = getClusters(k8sObjects);
    expect(clusters).toEqual(['cluster1']);
    expect(errors).toEqual([
      [{ errorType: 'FETCH_ERROR', message: 'Could not fetch resources' }],
    ]);
  });

  it('getTektonResources should return the tekton resources if exists', () => {
    const plrResources = getTektonResources(0, kubernetesObjects);
    expect(plrResources).toEqual({
      pipelineruns: {
        data: mockKubernetesPlrResponse.pipelineruns,
      },
      pods: {
        data: mockKubernetesPlrResponse.pods,
      },
    });
  });

  it('getTektonResources should not return the tekton resources if does not exists', () => {
    const plrResources = getTektonResources(1, kubernetesObjects);
    expect(plrResources).toEqual({});
  });

  it('totalPipelineRunTasks should return the total number of tasks in a pipeline run', () => {
    const totalTasks = totalPipelineRunTasks(
      mockKubernetesPlrResponse.pipelineruns[0],
    );
    expect(totalTasks).toEqual(3);
  });

  it('getTaskStatusOfPLR should return the updated task status', () => {
    const updatedTaskStatus = getTaskStatusOfPLR(
      mockKubernetesPlrResponse.pipelineruns[0],
      [mockKubernetesPlrResponse.taskruns[0]],
    );
    expect(updatedTaskStatus).toEqual({
      PipelineNotStarted: 0,
      Pending: 2,
      Running: 1,
      Succeeded: 0,
      Failed: 0,
      Cancelled: 0,
      Skipped: 0,
    });
  });

  it('getTaskStatusOfPLR should return the updated task status if no taskrun exist', () => {
    const mockPipelineRun = {
      ...kubernetesObjects.items[0].resources[0].resources[0],
      status: {},
    };
    const updatedTaskStatus = getTaskStatusOfPLR(mockPipelineRun, [
      mockKubernetesPlrResponse.taskruns[1],
    ]);
    expect(updatedTaskStatus).toEqual({
      PipelineNotStarted: 1,
      Pending: 0,
      Running: 0,
      Succeeded: 0,
      Failed: 0,
      Cancelled: 0,
      Skipped: 0,
    });
  });

  it('should return duration in seconds', () => {
    let duration = calculateDurationInSeconds(
      '2020-05-22T11:57:53Z',
      '2020-05-22T11:57:57Z',
    );
    expect(duration).toEqual(4);

    duration = calculateDurationInSeconds(
      '2020-05-22T11:57:53Z',
      '2020-05-22T12:02:20Z',
    );
    expect(duration).toBe(267);

    duration = calculateDurationInSeconds(
      '2020-05-22T10:57:53Z',
      '2020-05-22T12:57:57Z',
    );
    expect(duration).toBe(7204);
  });

  it('should return the right duration strings', () => {
    expect(getDuration(0, false)).toBe('less than a sec');
    expect(getDuration(0, true)).toBe('less than a sec');

    expect(getDuration(10, false)).toBe('10s');
    expect(getDuration(10, true)).toBe('10 seconds');

    expect(getDuration(60, false)).toBe('1m');
    expect(getDuration(60, true)).toBe('1 minute');

    expect(getDuration(3600 + 2 * 60 + 3, false)).toBe('1h 2m 3s');
    expect(getDuration(3600 + 2 * 60 + 3, true)).toBe(
      '1 hour 2 minutes 3 seconds',
    );

    expect(getDuration(48 * 3600 + 1, false)).toBe('48h 1s');
    expect(getDuration(48 * 3600 + 1, true)).toBe('48 hours 1 second');
  });

  it('should return definite duration', () => {
    let duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T11:57:57Z',
    );
    expect(duration).toEqual('4s');
    duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T11:57:57Z',
      true,
    );
    expect(duration).toEqual('4 seconds');
    duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T12:02:20Z',
    );
    expect(duration).toBe('4m 27s');
    duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T12:02:20Z',
      true,
    );
    expect(duration).toBe('4 minutes 27 seconds');
    duration = calculateDuration(
      '2020-05-22T10:57:53Z',
      '2020-05-22T12:57:57Z',
    );
    expect(duration).toBe('2h 4s');
  });

  it('should return expect duration for PipelineRun', () => {
    const duration = pipelineRunDuration(
      mockKubernetesPlrResponse.pipelineruns[0],
    );
    expect(duration).not.toBeNull();
    expect(duration).toBe('2 minutes 9 seconds');
  });

  it('should return expect duration as - for PipelineRun without start time', () => {
    const mockPipelineRun: PipelineRunKind = {
      ...mockKubernetesPlrResponse.pipelineruns[0],
      status: {
        ...mockKubernetesPlrResponse.pipelineruns[0].status,
        startTime: '',
      },
    };
    const duration = pipelineRunDuration(mockPipelineRun);
    expect(duration).not.toBeNull();
    expect(duration).toBe('-');
  });

  it('should return expect duration as - for PipelineRun without end time', () => {
    const mockPipelineRun: PipelineRunKind = {
      ...mockKubernetesPlrResponse.pipelineruns[1],
      status: {
        ...mockKubernetesPlrResponse.pipelineruns[1].status,
        completionTime: '',
      },
    };
    const duration = pipelineRunDuration(mockPipelineRun);
    expect(duration).not.toBeNull();
    expect(duration).toBe('-');
  });

  it('should be able to sort pipelineRunsData in ascending order based on pipelinerun name', () => {
    const mockPipelineRuns: PipelineRunKind[] = [
      ...mockKubernetesPlrResponse.pipelineruns,
    ];

    const sortedData: PipelineRunKind[] = Array.from(mockPipelineRuns).sort(
      getComparator('asc', 'metadata.name', 'name'),
    );
    expect(sortedData[0].metadata?.name).toBe('pipeline-test-wbvtlk');
  });

  it('should be able to sort pipelineRunsData in ascending order based on pipelinerun start time', () => {
    const mockPipelineRuns: PipelineRunKind[] = [
      ...mockKubernetesPlrResponse.pipelineruns,
    ];

    const sortedData: PipelineRunKind[] = Array.from(mockPipelineRuns).sort(
      getComparator('asc', 'status.startTime', 'start-time'),
    );
    expect(sortedData[0].metadata?.name).toBe('ruby-ex-git-xf45fo');
  });

  it('should be able to sort pipelineRunsData in ascending order based on pipelinerun duration', () => {
    const mockPipelineRuns: PipelineRunKind[] = [
      ...mockKubernetesPlrResponse.pipelineruns,
    ];

    const sortedData: PipelineRunKind[] = Array.from(mockPipelineRuns).sort(
      getComparator('asc', 'status.completionTime', 'duration'),
    );
    expect(sortedData[0].metadata?.name).toBe('ruby-ex-git-xf45fo');
  });
  it('should be able to sort pipelineRunsData in ascending order based on pipelinerun vulnerabilities', () => {
    const mockPipelineRun: PipelineRunKind =
      mockKubernetesPlrResponse.pipelineruns[1];

    const pipelineRunA: PipelineRunKind = {
      ...mockPipelineRun,
      metadata: { ...mockPipelineRun.metadata, name: 'A' },
      status: {
        ...mockPipelineRun.status,
        results: [
          {
            name: 'SCAN_OUTPUT',
            value:
              '{"vulnerabilities":{\n"critical": 13,\n"high": 29,\n"medium": 32,\n"low": 3,\n"unknown": 0}\n}\n',
          },
        ],
      } as PipelineRunStatus,
    };
    const pipelineRunB: PipelineRunKind = {
      ...mockPipelineRun,
      metadata: { ...mockPipelineRun.metadata, name: 'B' },
      status: {
        ...mockPipelineRun.status,
        results: [
          {
            name: 'SCAN_OUTPUT',
            value:
              '{"vulnerabilities":{\n"critical": 1,\n"high": 29,\n"medium": 32,\n"low": 3,\n"unknown": 0}\n}\n',
          },
        ],
      } as PipelineRunStatus,
    };
    const pipelineRuns = [pipelineRunA, pipelineRunB];

    let sortedData: PipelineRunKind[] = Array.from(pipelineRuns).sort(
      getComparator('asc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('B');
    sortedData = Array.from(pipelineRuns).sort(
      getComparator('desc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('A');

    pipelineRunB.status!.results = [
      {
        name: 'SCAN_OUTPUT',
        value:
          '{"vulnerabilities":{\n"critical": 13,\n"high": 30,\n"medium": 2,\n"low": 2,\n"unknown": 0}\n}\n',
      },
    ];
    sortedData = Array.from(pipelineRuns).sort(
      getComparator('asc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('A');
    sortedData = Array.from(pipelineRuns).sort(
      getComparator('desc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('B');

    pipelineRunB.status!.results = [
      {
        name: 'SCAN_OUTPUT',
        value:
          '{"vulnerabilities":{\n"critical": 13,\n"high": 29,\n"medium": 33,\n"low": 2,\n"unknown": 0}\n}\n',
      },
    ];
    sortedData = Array.from(pipelineRuns).sort(
      getComparator('asc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('A');
    sortedData = Array.from(pipelineRuns).sort(
      getComparator('desc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('B');

    pipelineRunB.status!.results = [
      {
        name: 'SCAN_OUTPUT',
        value:
          '{"vulnerabilities":{\n"critical": 13,\n"high": 29,\n"medium": 32,\n"low": 4,\n"unknown": 0}\n}\n',
      },
    ];
    sortedData = Array.from(pipelineRuns).sort(
      getComparator('asc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('A');
    sortedData = Array.from(pipelineRuns).sort(
      getComparator('desc', 'status.results', 'vulnerabilities'),
    );
    expect(sortedData[0].metadata?.name).toBe('B');
  });
});
