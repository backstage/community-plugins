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
import { testPods } from '../__fixtures__/pods-data';
import { ContainerScope } from '../hooks/usePodLogsOfPipelineRun';
import { getPodLogs } from './log-downloader-utils';

describe('getPodLogs', () => {
  it('should return empty logs if there are no pods', async () => {
    const podLogsGetter = () => Promise.resolve({ text: '' });
    const logs = await getPodLogs([], podLogsGetter, 'cluster-1');

    expect(logs).toBe('');
  });

  it('should return logs if there are pods', async () => {
    const podLogsGetter = (p: ContainerScope) => {
      return Promise.resolve({ text: `${p.containerName}` });
    };
    const logs = await getPodLogs(testPods, podLogsGetter, 'cluster-1');

    expect(logs).toBe(`STEP-TKN
step-tkn
STEP-PRINT-SBOM-RESULTS
step-print-sbom-results
STEP-PRINT-SCAN-RESULTS
step-print-scan-results`);
  });

  it('should display logs only for the pods that has logs', async () => {
    const podLogsGetter = (p: ContainerScope) => {
      return Promise.resolve({ text: `${p.containerName}` });
    };

    const podsWithoutContainers = [
      testPods[0],

      { ...testPods[1], spec: { ...testPods[1].spec, containers: [] } },
    ];

    const logs = await getPodLogs(
      podsWithoutContainers,
      podLogsGetter,
      'cluster-1',
    );

    expect(logs).toBe(`STEP-TKN
step-tkn
`);
  });
});
