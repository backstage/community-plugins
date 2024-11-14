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
import { renderHook } from '@testing-library/react';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { usePipelineRunScanResults } from './usePipelineRunScanResults';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('usePipelineRunVulnerabilities', () => {
  it('should return vulnerabilities when SCAN_OUTPUT is set', () => {
    const { result } = renderHook(() =>
      usePipelineRunScanResults(mockKubernetesPlrResponse.pipelineruns[2]),
    );

    expect(result.current.vulnerabilities?.critical).toEqual(13);
    expect(result.current.vulnerabilities?.high).toEqual(29);
    expect(result.current.vulnerabilities?.medium).toEqual(32);
    expect(result.current.vulnerabilities?.low).toEqual(3);
  });
  it('should return vulnerabilities when the suffix SCAN_OUTPUT is set', () => {
    const { result } = renderHook(() =>
      usePipelineRunScanResults(mockKubernetesPlrResponse.pipelineruns[4]),
    );

    expect(result.current.vulnerabilities?.critical).toEqual(1);
    expect(result.current.vulnerabilities?.high).toEqual(9);
    expect(result.current.vulnerabilities?.medium).toEqual(20);
    expect(result.current.vulnerabilities?.low).toEqual(1);
  });
  it('should accumulate all vulnerabilities', () => {
    const { result } = renderHook(() => {
      const results4 =
        mockKubernetesPlrResponse.pipelineruns[4].status.pipelineResults?.[0];
      const results1 =
        mockKubernetesPlrResponse.pipelineruns[2].status.results?.[0];
      const plr = {
        ...mockKubernetesPlrResponse.pipelineruns[2],
        status: {
          ...mockKubernetesPlrResponse.pipelineruns[2].status,
          results: results4 && results1 ? [results4, results1] : [],
        },
      };
      return usePipelineRunScanResults(plr);
    });

    expect(result.current.vulnerabilities?.critical).toEqual(14);
    expect(result.current.vulnerabilities?.high).toEqual(38);
    expect(result.current.vulnerabilities?.medium).toEqual(52);
    expect(result.current.vulnerabilities?.low).toEqual(4);
  });
});
