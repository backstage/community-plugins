import {
  V1LabelSelector,
  V1MicroTime,
  V1ObjectMeta,
  V1PodTemplateSpec,
} from '@kubernetes/client-node';

import { AnalysisRunPhase } from './analysisRuns';

export const ROLLOUT_REVISION_ANNOTATION = 'rollout.argoproj.io/revision';
export const APP_KUBERNETES_INSTANCE_LABEL = 'app.kubernetes.io/instance';

export type RolloutPhaseType = (typeof RolloutPhase)[keyof typeof RolloutPhase];
export type RolloutPauseReason =
  | 'InconclusiveAnalysisRun'
  | 'InconclusiveExperiment'
  | 'CanaryPauseStep'
  | 'BlueGreenPause';

export type RolloutConditionType =
  | 'InvalidSpec'
  | 'Available'
  | 'Progressing'
  | 'ReplicaFailure'
  | 'Paused'
  | 'Completed'
  | 'Healthy';

export const RolloutPhase = {
  Healthy: 'Healthy',
  Degraded: 'Degraded',
  Progressing: 'Progressing',
  Paused: 'Paused',
} as const;

/** Rollout types */
export interface Rollout {
  apiVersion?: string;
  kind?: string;
  metadata: V1ObjectMeta;
  spec: {
    replicas?: number;
    selector?: V1LabelSelector;
    template?: V1PodTemplateSpec;
    workloadRef?: {
      apiVersion?: string;
      kind?: string;
      name?: string;
      scaleDown?: string;
    };
    minReadySeconds?: number;
    rollbackWindow?: {
      revisions: number;
    };
    strategy: {
      blueGreen?: BlueGreenStrategy;
      canary?: CanaryStrategy;
    };
    revisionHistoryLimit?: number;
    paused?: boolean;
    progressDeadlineSeconds?: number;
    progressDeadlineAbort?: boolean;
    restartAt?: V1MicroTime;
    analysis?: {
      successfulRunHistoryLimit?: number;
      unsuccessfulRunHistoryLimit?: number;
    };
  };
  status?: RolloutStatus;
}

interface BlueGreenStatus {
  previewSelector?: string;
  activeSelector?: string;
  scaleUpPreviewCheckPoint?: boolean;
  prePromotionAnalysisRunStatus?: RolloutAnalysisRunStatus;
  postPromotionAnalysisRunStatus?: RolloutAnalysisRunStatus;
}

interface RolloutStatus {
  abort?: boolean;
  pauseConditions?: {
    reason: RolloutPauseReason;
    startTime: V1MicroTime;
  }[];
  controllerPause?: boolean;
  abortedAt?: V1MicroTime;
  currentPodHash?: string;
  currentStepHash?: string;
  replicas?: number;
  updatedReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  currentStepIndex?: number;
  collisionCount?: number;
  observedGeneration?: string;
  conditions?: RolloutCondition[];
  canary?: CanaryStatus;
  blueGreen?: BlueGreenStatus;
  HPAReplicas?: number;
  selector?: string;
  stableRS?: string;
  restartedAt?: V1MicroTime;
  promoteFull?: boolean;
  phase?: RolloutPhaseType;
  message?: string;
  workloadObservedGeneration?: string;
}

declare interface RolloutCondition {
  type: RolloutConditionType;
  status: string;
  lastUpdateTime: string;
  lastTransitionTime: string;
  reason: string;
  message: string;
}

interface RolloutAnalysisRunStatus {
  name: string;
  status: AnalysisRunPhase;
  message?: string;
}

interface CanaryStatus {
  currentStepAnalysisRunStatus?: RolloutAnalysisRunStatus;
  currentBackgroundAnalysisRunStatus?: RolloutAnalysisRunStatus;
  currentExperiment?: string;
  weights?: {
    canary: WeightDestination;
    stable: WeightDestination;
    additional?: WeightDestination[];
    verified?: boolean;
  };
  stablePingPong?: 'ping' | 'pong';
}

interface WeightDestination {
  weight: number;
  serviceName?: string;
  podTemplateHash?: string;
}

interface AntiAffinity {
  preferredDuringSchedulingIgnoredDuringExecution?: { weight: number };
  requiredDuringSchedulingIgnoredDuringExecution?: {};
}

interface PodTemplateMetadata {
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
}

interface AnalysisRunArgument {
  name: string;
  value?: string;
  valueFrom?: {
    podTemplateHashValue?: string;
    fieldRef?: {
      fieldPath: string;
    };
  };
}

export interface RolloutAnalysis {
  templates?: {
    templateName: string;
    clusterScope?: boolean;
  }[];
  args?: AnalysisRunArgument[];
  dryRun?: { metricName: string }[];
  measurementRetention?: { metricName: string; limit: number }[];
  analysisRunMetadata?: PodTemplateMetadata;
}

export interface BlueGreenStrategy {
  activeService: string;
  previewService?: string;
  previewReplicaCount?: number;
  autoPromotionEnabled?: boolean;
  autoPromotionSeconds?: number;
  maxUnavailable?: number | string;
  scaleDownDelaySeconds?: number;
  scaleDownDelayRevisionLimit?: number;
  prePromotionAnalysis?: RolloutAnalysis;
  antiAffinity?: AntiAffinity;
  postPromotionAnalysis?: RolloutAnalysis;
  previewMetadata?: PodTemplateMetadata;
  activeMetadata?: PodTemplateMetadata;
  abortScaleDownDelaySeconds?: number;
}

interface CanaryStrategy {
  canaryService?: string;
  stableService?: string;
  steps?: CanaryStep[];
  trafficRouting?: { [key: string]: any };
  maxUnavailable?: number | string;
  maxSurge?: number | string;
  analysis?: {
    startingStep?: number;
  };
  antiAffinity?: AntiAffinity;
  canaryMetadata?: PodTemplateMetadata;
  stableMetadata?: PodTemplateMetadata;
  scaleDownDelaySeconds?: number;
  scaleDownDelayRevisionLimit?: number;
  abortScaleDownDelaySeconds?: number;
  dynamicStableScale?: boolean;
  pingPong?: {
    pingService: string;
    pongService: string;
  };
  minPodsPerReplicaSet?: number;
}

interface StringMatch {
  exact?: string;
  prefix?: string;
  regex?: string;
}

export interface CanaryStep {
  setWeight?: number;
  pause?: {
    duration?: number | string;
  };
  experiment?: {
    templates: {
      name: string;
      specRef: string;
      replicas?: number;
      metadata?: PodTemplateMetadata;
      selector?: V1LabelSelector;
      weight?: number;
      service?: {
        name?: string;
      };
    }[];
    duration?: string;
    analyses?: {
      name: string;
      templateName: string;
      clusterScope?: boolean;
      args?: AnalysisRunArgument[];
      requiredForCompletion?: boolean;
    }[];
    dryRun?: { metricName: string }[];
    analysisRunMetadata?: PodTemplateMetadata;
  };
  analysis?: RolloutAnalysis;
  setCanaryScale?: {
    weight?: number;
    replicas?: number;
    matchTrafficWeight?: boolean;
  };
  setHeaderRoute?: {
    name?: string;
    match?: {
      headerName: string;
      headerValue?: StringMatch;
    }[];
  };
  setMirrorRoute?: {
    name: string;
    match?: {
      method?: StringMatch;
      path?: StringMatch;
      headers?: { [key: string]: StringMatch };
    }[];
    percentage?: number;
  };
  plugin?: {
    name: string;
    config?: any;
  };
}
