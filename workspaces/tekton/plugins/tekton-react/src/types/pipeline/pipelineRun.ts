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

/**
 * The step for the task run.
 *
 * @public
 */
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

/**
 * The parameters for the pipeline run.
 *
 * @public
 */
export type PipelineRunParam = {
  name: string;
  value: string | string[];
  input?: string;
  output?: string;
  resource?: object;
};

/**
 * The workspace for the pipeline run.
 *
 * @public
 */
export type PipelineRunWorkspace = {
  name: string;
  [volumeType: string]: {};
};

/**
 * The embedded resource parameter for the pipeline run.
 *
 * @public
 */
export type PipelineRunEmbeddedResourceParam = { name: string; value: string };

/**
 * The embedded resource for the pipeline run.
 *
 * @public
 */
export type PipelineRunEmbeddedResource = {
  name: string;
  resourceSpec: {
    params: PipelineRunEmbeddedResourceParam[];
    type: string;
  };
};

/**
 * The reference resource for the pipeline run.
 *
 * @public
 */
export type PipelineRunReferenceResource = {
  name: string;
  resourceRef: {
    name: string;
  };
};

/**
 * The resource for the pipeline run.
 *
 * @public
 */
export type PipelineRunResource =
  | PipelineRunReferenceResource
  | PipelineRunEmbeddedResource;

/**
 * The data for the task run.
 *
 * @public
 */
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

/**
 * The task runs for the pipeline run.
 *
 * @public
 */
export type PLRTaskRuns = {
  [taskRunName: string]: PLRTaskRunData;
};

/**
 * The status for the pipeline run.
 *
 * @public
 */
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

/**
 * The kind for the pipeline run.
 *
 * @public
 */
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

/**
 * The task with status for the pipeline run.
 *
 * @public
 */
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
