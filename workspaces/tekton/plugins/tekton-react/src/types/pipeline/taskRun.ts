/*
 * Copyright 2025 The Backstage Authors
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
  V1ConfigMap,
  V1ObjectMeta,
  V1PersistentVolumeClaimTemplate,
  V1Secret,
} from '@kubernetes/client-node';

import {
  Condition,
  PipelineTaskParam,
  PipelineTaskRef,
  TektonResource,
  TektonResultsRun,
  TektonTaskSpec,
} from './pipeline';
import { PLRTaskRunStep } from './pipelineRun';

export type VolumeTypePVC = {
  claimName: string;
};

export type TaskRunWorkspace = {
  name: string;
  volumeClaimTemplate?: V1PersistentVolumeClaimTemplate;
  persistentVolumeClaim?: VolumeTypePVC;
  configMap?: V1ConfigMap;
  emptyDir?: {};
  secret?: V1Secret;
  subPath?: string;
};

export type TaskRunStatus = {
  completionTime?: string;
  conditions?: Condition[];
  podName?: string;
  startTime?: string;
  steps?: PLRTaskRunStep[];
  taskResults?: TektonResultsRun[];
  results?: TektonResultsRun[];
};

export type TaskRunKind = {
  apiVersion?: string;
  kind?: string;
  metadata?: V1ObjectMeta;
  spec: {
    taskRef?: PipelineTaskRef;
    taskSpec?: TektonTaskSpec;
    serviceAccountName?: string;
    params?: PipelineTaskParam[];
    resources?: TektonResource[] | {};
    timeout?: string;
    workspaces?: TaskRunWorkspace[];
  };
  status?: TaskRunStatus;
};
