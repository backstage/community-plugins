/*
 * Copyright 2026 The Backstage Authors
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

import { IncrementalEntityProviderOptions } from '@backstage/plugin-catalog-backend-module-incremental-ingestion';

export type AwsInfrastructureConfig = {
  id: string;
  region?: string;
  accountId?: string;
  filters: FilterDefinition;
  transform?: TransformDefinition;
  aggregator?: string;
  hashEntityNames: boolean;
  options?: AwsInfrastructureConfigOptions;
};

export interface AwsInfrastructureConfigOptions {
  incremental?: Partial<IncrementalEntityProviderOptions>;
  pageSize?: number;
}

export interface AwsConfigResource {
  configuration: any;
  resourceId: string;
  resourceName?: string;
  resourceType: string;
  arn: string;
  tags: AwsTagValue[];
  awsRegion?: string;
  accountId: string;
}

export interface AwsTagValue {
  tag: string;
  key: string;
  value: string;
}

export interface TransformDefinition {
  fields?: FieldsTransformDefinition;
}

export interface FieldsTransformDefinition {
  spec?: FieldsSpecTransformDefinition;
  name?: FieldTransformDefinition;
  annotations?: Map<string, FieldTransformDefinition>;
}

export interface FieldsSpecTransformDefinition {
  owner?: FieldTransformDefinition;
  system?: FieldTransformDefinition;
  component?: FieldTransformDefinition;
  type?: FieldTransformDefinition;
}

export interface FieldTransformDefinition {
  tag?: string;
  value?: string;
  expression?: string;
}

export interface FilterDefinition {
  tagFilters?: TagFilterDefinition[];
  resourceTypes: string[];
}

export interface TagFilterDefinition {
  key: string;
  value?: string;
}
