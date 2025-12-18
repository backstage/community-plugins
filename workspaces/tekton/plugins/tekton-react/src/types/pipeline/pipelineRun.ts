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

import { V1ObjectMeta } from '@kubernetes/client-node';

import {
  Condition,
  PipelineSpec,
  PipelineTask,
  TektonResultsRun,
  TektonTaskSpec,
} from './pipeline';

export type PLRTaskRunStep = {
  container: string;
  imageID?: string;
  name: string;
  waiting?: {
    reason: string;
  };
  running?: {
    startedAt: string;
  };
  terminated?: {
    containerID: string;
    exitCode: number;
    finishedAt: string;
    reason: string;
    startedAt: string;
    message?: string;
  };
};

export type PipelineRunParam = {
  name: string;
  value: string | string[];
  input?: string;
  output?: string;
  resource?: object;
};

export type PipelineRunWorkspace = {
  name: string;
  [volumeType: string]: {};
};

export type PipelineRunEmbeddedResourceParam = { name: string; value: string };

export type PipelineRunEmbeddedResource = {
  name: string;
  resourceSpec: {
    params: PipelineRunEmbeddedResourceParam[];
    type: string;
  };
};

export type PipelineRunReferenceResource = {
  name: string;
  resourceRef: {
    name: string;
  };
};

export type PipelineRunResource =
  | PipelineRunReferenceResource
  | PipelineRunEmbeddedResource;

export type PLRTaskRunData = {
  pipelineTaskName: string;
  status?: {
    completionTime?: string;
    conditions: Condition[];
    podName: string;
    startTime: string;
    steps?: PLRTaskRunStep[];
    taskSpec?: TektonTaskSpec;
    taskResults?: { name: string; value: string; type?: string }[];
  };
};

export type PLRTaskRuns = {
  [taskRunName: string]: PLRTaskRunData;
};

export type PipelineRunStatus = {
  succeededCondition?: string;
  creationTimestamp?: string;
  conditions?: Condition[];
  startTime?: string;
  completionTime?: string;
  taskRuns?: PLRTaskRuns;
  pipelineSpec: PipelineSpec;
  skippedTasks?: {
    name: string;
  }[];
  pipelineResults?: TektonResultsRun[]; // in tekton v1 pipelineResults is renamed to results
  results?: TektonResultsRun[];
};

export type PipelineRunKind = {
  apiVersion?: string;
  kind?: string;
  metadata?: V1ObjectMeta;
  spec: {
    pipelineRef?: { name: string };
    pipelineSpec?: PipelineSpec;
    params?: PipelineRunParam[];
    workspaces?: PipelineRunWorkspace[];
    resources?: PipelineRunResource[];
    serviceAccountName?: string;
    timeout?: string;
    status?: string;
  };
  status?: PipelineRunStatus;
};

export type PipelineTaskWithStatus = PipelineTask & {
  status: {
    reason: string;
    completionTime?: string;
    conditions: Condition[];
    podName?: string;
    startTime?: string;
    steps?: PLRTaskRunStep[];
    taskSpec?: TektonTaskSpec;
    taskResults?: { name: string; value: string }[];
    duration?: string;
  };
};
