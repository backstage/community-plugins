import { Specification } from '@severlessworkflow/sdk-typescript';
import { dump } from 'js-yaml';

import { ASSESSMENT_WORKFLOW_TYPE } from './constants';
import { ProcessInstanceVariables } from './models';
import { WorkflowCategory, WorkflowDefinition, WorkflowFormat } from './types';

export function fromWorkflowSource(content: string): WorkflowDefinition {
  const parsed = Specification.Workflow.fromSource(content);
  const workflow = parsed.sourceModel ?? parsed;
  return removeProperty(workflow, 'normalize');
}

export function toWorkflowString(
  definition: WorkflowDefinition,
  format: WorkflowFormat,
): string {
  switch (format) {
    case 'json':
      return toWorkflowJson(definition);
    case 'yaml':
      return toWorkflowYaml(definition);
    default:
      throw new Error(`Unsupported format ${format}`);
  }
}

export function toWorkflowJson(definition: WorkflowDefinition): string {
  return JSON.stringify(definition, null, 2);
}

export function toWorkflowYaml(definition: WorkflowDefinition): string {
  return dump(definition);
}

export function extractWorkflowFormatFromUri(uri: string): WorkflowFormat {
  const match = RegExp(/\.sw\.(json|yaml|yml)$/).exec(uri);
  if (match) {
    if (match[1] === 'yml' || match[1] === 'yaml') {
      return 'yaml';
    }
    if (match[1] === 'json') {
      return 'json';
    }
  }
  throw new Error(`Unsupported workflow format for uri ${uri}`);
}

export function getWorkflowCategory(
  definition: WorkflowDefinition | undefined,
): WorkflowCategory {
  if (definition === undefined) {
    return WorkflowCategory.INFRASTRUCTURE;
  }
  return definition?.annotations?.find(
    annotation => annotation === ASSESSMENT_WORKFLOW_TYPE,
  )
    ? WorkflowCategory.ASSESSMENT
    : WorkflowCategory.INFRASTRUCTURE;
}

function removeProperty<T>(obj: T, propToDelete: string): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeProperty(item, propToDelete)) as T;
  }

  const newObj: any = {};

  for (const key in obj) {
    if (key !== propToDelete) {
      newObj[key] = removeProperty(obj[key], propToDelete); // Recurse into nested objects
    }
  }

  return newObj;
}

export function parseWorkflowVariables(
  variables: ProcessInstanceVariables | string | undefined,
): ProcessInstanceVariables | undefined {
  if (variables === undefined) {
    return undefined;
  }

  if (typeof variables === 'string') {
    try {
      return JSON.parse(variables) as ProcessInstanceVariables;
    } catch {
      throw new Error(
        `Error when parsing process instance variables: ${variables}`,
      );
    }
  }

  return variables;
}

export function extractWorkflowFormat(source: string): WorkflowFormat {
  try {
    JSON.parse(source);
    return 'json';
  } catch (_) {
    return 'yaml';
  }
}
