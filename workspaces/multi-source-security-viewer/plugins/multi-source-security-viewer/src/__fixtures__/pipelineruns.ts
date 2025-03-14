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
import { PipelineRun, RunStatus } from '../types/pipelinerun';
import { mockACSImageScanResult } from './acsimagescanresult';
import { mockACSImageCheckResults } from './acsimagecheckresults';
import { mockACSDeploymentCheckResults } from './acsdeploymentcheckresults';
import { mockECResults } from './ec';
import { mockRawLogs } from './rawlogs';

export const mockPipelineRuns: PipelineRun[] = [
  {
    id: 'pipelinerun-1',
    displayName: 'pipeline-run-1',
    status: RunStatus.Failed,
    logs: mockRawLogs,
    ec: {
      data: mockECResults,
    },
    acsImagesScanResult: {
      data: mockACSImageScanResult,
    },
  },
  {
    id: 'pipelinerun-2',
    displayName: 'pipeline-run-2',
    status: RunStatus.Succeeded,
    logs: mockRawLogs,
    ec: {
      data: mockECResults,
    },
    acsImagesScanResult: {
      data: mockACSImageScanResult,
    },
    acsImageCheckResults: {
      data: mockACSImageCheckResults,
    },
    acsDeploymentCheckResults: {
      data: mockACSDeploymentCheckResults,
    },
  },
];
