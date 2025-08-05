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
import { useMemo } from 'react';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { PipelineRunScanResults } from '../types/types';

const SCAN_OUTPUT_SUFFIX = 'SCAN_OUTPUT';

export const getPipelineRunScanResults = (
  pipelineRun: PipelineRunKind,
): PipelineRunScanResults =>
  (pipelineRun.status?.results || pipelineRun.status?.pipelineResults)?.reduce(
    (acc, result) => {
      if (result.name?.endsWith(SCAN_OUTPUT_SUFFIX)) {
        if (!acc.vulnerabilities) {
          acc.vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };
        }
        try {
          const taskVulnerabilities = JSON.parse(result.value);
          if (taskVulnerabilities.vulnerabilities) {
            acc.vulnerabilities.critical +=
              taskVulnerabilities.vulnerabilities.critical || 0;
            acc.vulnerabilities.high +=
              taskVulnerabilities.vulnerabilities.high || 0;
            acc.vulnerabilities.medium +=
              taskVulnerabilities.vulnerabilities.medium || 0;
            acc.vulnerabilities.low +=
              taskVulnerabilities.vulnerabilities.low || 0;
          }
        } catch (e) {
          // ignore
        }
      }
      return acc;
    },
    {} as PipelineRunScanResults,
  ) || {};

export const usePipelineRunScanResults = (
  pipelineRun: PipelineRunKind,
): PipelineRunScanResults => {
  return useMemo(() => {
    if (!pipelineRun) {
      return {};
    }

    return getPipelineRunScanResults(pipelineRun);
  }, [pipelineRun]);
};
