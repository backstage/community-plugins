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
