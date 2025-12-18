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

export type TektonParam = {
  default?: string | string[];
  description?: string;
  name: string;
  type?: string;
};

export type TektonResource = {
  name: string;
  optional?: boolean;
  type: string;
};

export type TektonWorkspace = {
  name: string;
  description?: string;
  mountPath?: string;
  readOnly?: boolean;
  optional?: boolean;
};

export type TektonResourceGroup<ResourceType> = {
  inputs?: ResourceType[];
  outputs?: ResourceType[];
};

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

export type TaskResult = {
  name: string;
  description?: string;
};

export type TektonTaskSpec = {
  metadata?: {};
  description?: string;
  steps: TektonTaskSteps[];
  params?: TektonParam[];
  resources?: TektonResourceGroup<TektonResource>;
  results?: TaskResult[];
  workspaces?: TektonWorkspace[];
};

export type TektonResultsRun = {
  name: string;
  type?: string;
  value: string;
};

export type PipelineTaskRef = {
  kind?: string;
  name: string;
};

export type PipelineTaskWorkspace = {
  name: string;
  workspace: string;
  optional?: boolean;
};

export type PipelineTaskResource = {
  name: string;
  resource?: string;
  from?: string[];
};

export type PipelineTaskParam = {
  name: string;
  value: any;
};

export type WhenExpression = {
  input: string;
  operator: string;
  values: string[];
};

export type PipelineResult = {
  name: string;
  value: string;
  description?: string;
};

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

export type PipelineSpec = {
  params?: TektonParam[];
  resources?: TektonResource[];
  serviceAccountName?: string;
  tasks: PipelineTask[];
  workspaces?: TektonWorkspace[];
  finally?: PipelineTask[];
  results?: PipelineResult[];
};

export type Condition = {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
};
