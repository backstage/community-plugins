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
  ACSCheckResults,
  ACSImageScanResult,
  EnterpriseContractPolicy,
} from '@aonic-ui/pipelines';

export type PipelineRunLogStep = {
  name: string;
  logs: string;
};

export enum RunStatus {
  // from @aonic-ui/pipelines to be used with Output
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Running = 'Running',
  'In Progress' = 'In Progress',
  FailedToStart = 'FailedToStart',
  PipelineNotStarted = 'Starting',
  WithoutStatusConditions = 'WithoutStatusConditions',
  NeedsMerge = 'PR needs merge',
  Skipped = 'Skipped',
  Cancelled = 'Cancelled',
  Cancelling = 'Cancelling',
  Pending = 'Pending',
  Idle = 'Idle',
  TestWarning = 'Test Warnings',
  TestFailed = 'Test Failures',
  Unknown = 'Unknown',
}

export enum GitlabPipelineStatus {
  success = 'success',
  failed = 'failed',
  cancelled = 'cancelled',
  pending = 'pending',
  running = 'running',
}

export enum JenkinsRunStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  ABORTED = 'ABORTED',
  UNSTABLE = 'UNSTABLE',
  NOT_BUILT = 'NOT_BUILT',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  'IN PROGRESS' = 'IN PROGRESS',
  PENDING = 'PENDING',
}

export type PipelineRun = {
  id?: string;
  displayName?: string;
  status?: RunStatus;
  logs?: string;
  steps?: PipelineRunLogStep[];
  tpaLink?: { TPA_SBOM_URL: string };
  ec?: {
    data: EnterpriseContractPolicy[];
  };
  acsImagesScanResult?: {
    data: ACSImageScanResult;
  };
  acsImageCheckResults?: {
    data: ACSCheckResults;
  };
  acsDeploymentCheckResults?: {
    data: ACSCheckResults;
  };
};
