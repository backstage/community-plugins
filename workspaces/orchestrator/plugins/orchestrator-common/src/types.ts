import { JsonObject } from '@backstage/types';

import { Specification } from '@severlessworkflow/sdk-typescript';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { ProcessInstance, ProcessInstanceStateValues } from './models';

type Id<T> = { [P in keyof T]: T[P] };

type OmitDistributive<T, K extends PropertyKey> = T extends any
  ? T extends object
    ? Id<OmitRecursively<T, K>>
    : T
  : never;

export type OmitRecursively<T, K extends PropertyKey> = Omit<
  { [P in keyof T]: OmitDistributive<T[P], K> },
  K
>;

export type WorkflowDefinition = OmitRecursively<
  Specification.Workflow,
  'normalize'
>;

export type WorkflowListResult = {
  items: WorkflowDefinition[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type WorkflowOverviewListResult = {
  items: WorkflowOverview[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type WorkflowFormat = 'yaml' | 'json';

export type WorkflowInputSchemaStep = {
  schema: JsonObjectSchema;
  title: string;
  key: string;
  data: JsonObject;
  readonlyKeys: string[];
};

export type JsonObjectSchema = Omit<JSONSchema7, 'properties'> & {
  properties: { [key: string]: JSONSchema7 };
};

export type ComposedSchema = Omit<JSONSchema7, 'properties'> & {
  properties: {
    [key: string]: Omit<JSONSchema7, 'properties'> & {
      properties: { [key: string]: JsonObjectSchema };
    };
  };
};

export const isJsonObjectSchema = (
  schema: JSONSchema7 | JsonObjectSchema | JSONSchema7Definition,
): schema is JsonObjectSchema =>
  typeof schema === 'object' &&
  !!schema.properties &&
  Object.values(schema.properties).filter(
    curSchema => typeof curSchema !== 'object',
  ).length === 0;

export const isComposedSchema = (
  schema: JSONSchema7 | ComposedSchema,
): schema is ComposedSchema =>
  !!schema.properties &&
  Object.values(schema.properties).filter(
    curSchema => !isJsonObjectSchema(curSchema),
  ).length === 0;

export interface WorkflowInputSchemaResponse {
  definition: WorkflowDefinition;
  schemaSteps: WorkflowInputSchemaStep[];
  isComposedSchema: boolean;
  schemaParseError?: string;
}

export interface WorkflowExecutionResponse {
  id: string;
}

export enum WorkflowCategory {
  ASSESSMENT = 'assessment',
  INFRASTRUCTURE = 'infrastructure',
}

export interface WorkflowOverview {
  workflowId: string;
  format: WorkflowFormat;
  name?: string;
  lastRunId?: string;
  lastTriggeredMs?: number;
  lastRunStatus?: ProcessInstanceStateValues;
  category?: string;
  avgDurationMs?: number;
  description?: string;
}

export interface WorkflowInfo {
  id: string;
  type?: string;
  name?: string;
  version?: string;
  annotations?: string[];
  description?: string;
  inputSchema?: JSONSchema7;
  endpoint?: string;
  serviceUrl?: string;
  roles?: string[];
  source?: string;
  metadata?: Map<string, string>;
  nodes?: Node[];
}

export interface Node {
  id: string;
  type?: string;
  name?: string;
  uniqueId?: string;
  nodeDefinitionId?: string;
}

export interface AssessedProcessInstance {
  instance: ProcessInstance;
  assessedBy?: ProcessInstance;
}
