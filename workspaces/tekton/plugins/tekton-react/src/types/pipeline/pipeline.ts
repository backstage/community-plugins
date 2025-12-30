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

/**
 * The parameters for the task.
 *
 * @public
 */
export type TektonParam = {
  default?: string | string[];
  description?: string;
  name: string;
  type?: string;
};

/**
 * The resources for the task.
 *
 * @public
 */
export type TektonResource = {
  name: string;
  optional?: boolean;
  type: string;
};

/**
 * The workspaces for the task.
 *
 * @public
 */
export type TektonWorkspace = {
  name: string;
  description?: string;
  mountPath?: string;
  readOnly?: boolean;
  optional?: boolean;
};

/**
 * The resource group for the task.
 *
 * @public
 */
export type TektonResourceGroup<ResourceType> = {
  inputs?: ResourceType[];
  outputs?: ResourceType[];
};

/**
 * The steps for the task.
 *
 * @public
 */
export type TektonTaskSteps = {
  name: string;
  args?: string[];
  command?: string[];
  image?: string;
  resources?: {}[] | {};
  env?: { name: string; value?: string }[];
  script?: string;
  workingDir?: string;
  volumeMounts?: { name: string; mountPath: string }[];
};

/**
 * The results for the task.
 *
 * @public
 */
export type TaskResult = {
  name: string;
  description?: string;
};

/**
 * The specification for the task.
 *
 * @public
 */
export type TektonTaskSpec = {
  metadata?: {};
  description?: string;
  steps: TektonTaskSteps[];
  params?: TektonParam[];
  resources?: TektonResourceGroup<TektonResource>;
  results?: TaskResult[];
  workspaces?: TektonWorkspace[];
};

/**
 * The results for the task run.
 *
 * @public
 */
export type TektonResultsRun = {
  name: string;
  type?: string;
  value: string;
};

/**
 * The reference for the task.
 *
 * @public
 */
export type PipelineTaskRef = {
  kind?: string;
  name: string;
};

/**
 * The workspace for the task.
 *
 * @public
 */
export type PipelineTaskWorkspace = {
  name: string;
  workspace: string;
  optional?: boolean;
};

/**
 * The resource for the task.
 *
 * @public
 */
export type PipelineTaskResource = {
  name: string;
  resource?: string;
  from?: string[];
};

/**
 * The parameters for the task.
 *
 * @public
 */
export type PipelineTaskParam = {
  name: string;
  value: any;
};

/**
 * The when expression for the task.
 *
 * @public
 */
export type WhenExpression = {
  input: string;
  operator: string;
  values: string[];
};

/**
 * The result for the task.
 *
 * @public
 */
export type PipelineResult = {
  name: string;
  value: string;
  description?: string;
};

/**
 * The task for the pipeline.
 *
 * @public
 */
export type PipelineTask = {
  name: string;
  params?: PipelineTaskParam[];
  resources?: TektonResourceGroup<PipelineTaskResource>;
  runAfter?: string[];
  taskRef?: PipelineTaskRef;
  taskSpec?: TektonTaskSpec;
  when?: WhenExpression[];
  workspaces?: PipelineTaskWorkspace[];
};

/**
 * The specification for the pipeline.
 *
 * @public
 */
export type PipelineSpec = {
  params?: TektonParam[];
  resources?: TektonResource[];
  serviceAccountName?: string;
  tasks: PipelineTask[];
  workspaces?: TektonWorkspace[];
  finally?: PipelineTask[];
  results?: PipelineResult[];
};

/**
 * The condition for the pipeline.
 *
 * @public
 */
export type Condition = {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
};
