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
import { V1ObjectMeta } from '@kubernetes/client-node';

export type AnalysisRunPhase =
  (typeof AnalysisRunPhases)[keyof typeof AnalysisRunPhases];

export const AnalysisRunPhases = {
  Pending: 'Pending',
  Running: 'Running',
  Successful: 'Successful',
  Failed: 'Failed',
  Error: 'Error',
  Inconclusive: 'Inconclusive',
} as const;

export interface AnalysisRun {
  apiVersion?: string;
  kind?: string;
  metadata: V1ObjectMeta;
  spec: AnalysisRunSpec;
  status?: AnalysisRunStatus;
}

interface AnalysisRunSpec {
  metrics: {
    name: string;
    interval?: string;
    initialDelay?: string;
    count?: number | string;
    successCondition?: string;
    failureCondition?: string;
    failureLimit?: number | string;
    inconclusiveLimit?: number | string;
    consecutiveErrorLimit?: number | string;
    provider: any;
  }[];
  args?: {
    name: string;
    value?: string;
    valueFrom?: {
      podTemplateHashValue?: string;
      fieldRef?: {
        fieldPath: string;
      };
    };
  }[];
  terminate?: boolean;
  dryRun?: { metricName: string }[];
  measurementRetention?: { metricName: string; limit: number }[];
  ttlStrategy?: {
    secondsAfterCompletion?: number;
    secondsAfterFailure?: number;
    secondsAfterSuccess?: number;
  };
}

interface RunSummary {
  count?: number;
  successful?: number;
  failed?: number;
  inconclusive?: number;
  error?: number;
}

interface AnalysisRunStatus {
  phase: AnalysisRunPhase;
  message?: string;
  metricResults?: any[];
  startedAt?: string;
  runSummary?: RunSummary;
  dryRunSummary?: RunSummary;
  completedAt?: string;
}
