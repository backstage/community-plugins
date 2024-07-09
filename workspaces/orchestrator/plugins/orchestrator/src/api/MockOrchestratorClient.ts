import { JsonObject } from '@backstage/types';

import {
  AssessedProcessInstance,
  ProcessInstance,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInputSchemaResponse,
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@backstage-community/plugin-orchestrator-common';

import { hasOwnProp, isNonNullable } from '../utils/TypeGuards';
import { OrchestratorApi } from './api';

export interface MockOrchestratorApiData {
  executeWorkflowResponse: () => ReturnType<OrchestratorApi['executeWorkflow']>;
  getInstanceResponse: () => ReturnType<OrchestratorApi['getInstance']>;
  retriggerInstanceInErrorResponse: () => ReturnType<
    OrchestratorApi['retriggerInstanceInError']
  >;
  abortWorkflowInstanceResponse: () => ReturnType<
    OrchestratorApi['abortWorkflowInstance']
  >;
  listInstancesResponse: ReturnType<OrchestratorApi['listInstances']>;
  getWorkflowDefinitionResponse: ReturnType<
    OrchestratorApi['getWorkflowDefinition']
  >;
  getWorkflowSourceResponse: ReturnType<OrchestratorApi['getWorkflowSource']>;
  getWorkflowDataInputSchemaResponse: ReturnType<
    OrchestratorApi['getWorkflowDataInputSchema']
  >;
  listWorkflowOverviewsResponse: ReturnType<
    OrchestratorApi['listWorkflowOverviews']
  >;
  getWorkflowOverviewResponse: ReturnType<
    OrchestratorApi['getWorkflowOverview']
  >;
}

export class MockOrchestratorClient implements OrchestratorApi {
  private _mockData: Partial<MockOrchestratorApiData>;

  constructor(mockData: Partial<MockOrchestratorApiData> = {}) {
    this._mockData = mockData;
  }

  executeWorkflow(_args: {
    workflowId: string;
    parameters: JsonObject;
  }): Promise<WorkflowExecutionResponse> {
    if (
      !hasOwnProp(this._mockData, 'executeWorkflowResponse') ||
      !isNonNullable(this._mockData.executeWorkflowResponse)
    ) {
      throw new Error(`[executeWorkflow]: No mock data available`);
    }

    return this._mockData.executeWorkflowResponse();
  }

  getInstance(
    _instanceId: string,
    _includeAssessment: boolean,
  ): Promise<AssessedProcessInstance> {
    if (
      !hasOwnProp(this._mockData, 'getInstanceResponse') ||
      !isNonNullable(this._mockData.getInstanceResponse)
    ) {
      throw new Error(`[getInstance]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getInstanceResponse());
  }

  listInstances(): Promise<ProcessInstance[]> {
    if (
      !hasOwnProp(this._mockData, 'listInstancesResponse') ||
      !isNonNullable(this._mockData.listInstancesResponse)
    ) {
      throw new Error(`[listInstances]: No mock data available`);
    }

    return Promise.resolve(this._mockData.listInstancesResponse);
  }

  getWorkflowSource(_workflowId: string): Promise<string> {
    if (
      !hasOwnProp(this._mockData, 'getWorkflowSourceResponse') ||
      !isNonNullable(this._mockData.getWorkflowSourceResponse)
    ) {
      throw new Error(`[getWorkflowSource]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getWorkflowSourceResponse);
  }

  getWorkflowDefinition(_workflowId: string): Promise<WorkflowDefinition> {
    if (
      !hasOwnProp(this._mockData, 'getWorkflowDefinitionResponse') ||
      !isNonNullable(this._mockData.getWorkflowDefinitionResponse)
    ) {
      throw new Error(`[getWorkflowDefinition]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getWorkflowDefinitionResponse);
  }

  getWorkflowDataInputSchema(_args: {
    workflowId: string;
    instanceId?: string;
    assessmentInstanceId?: string;
  }): Promise<WorkflowInputSchemaResponse> {
    if (
      !hasOwnProp(this._mockData, 'getWorkflowDataInputSchemaResponse') ||
      !isNonNullable(this._mockData.getWorkflowDataInputSchemaResponse)
    ) {
      throw new Error(`[getWorkflowDataInputSchema]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getWorkflowDataInputSchemaResponse);
  }

  listWorkflowOverviews(): Promise<WorkflowOverviewListResult> {
    if (
      !hasOwnProp(this._mockData, 'listWorkflowOverviewsResponse') ||
      !isNonNullable(this._mockData.listWorkflowOverviewsResponse)
    ) {
      throw new Error(`[listWorkflowOverviews]: No mock data available`);
    }

    return Promise.resolve(this._mockData.listWorkflowOverviewsResponse);
  }

  getWorkflowOverview(): Promise<WorkflowOverview> {
    if (
      !hasOwnProp(this._mockData, 'getWorkflowOverviewResponse') ||
      !isNonNullable(this._mockData.getWorkflowOverviewResponse)
    ) {
      throw new Error(`[getWorkflowOverview]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getWorkflowOverviewResponse);
  }

  abortWorkflowInstance(_instanceId: string): Promise<void> {
    if (
      !hasOwnProp(this._mockData, 'abortWorkflowInstanceResponse') ||
      !isNonNullable(this._mockData.abortWorkflowInstanceResponse)
    ) {
      throw new Error(`[abortWorkflowInstance]: No mock data available`);
    }

    return this._mockData.abortWorkflowInstanceResponse();
  }

  retriggerInstanceInError(_args: {
    instanceId: string;
    inputData: JsonObject;
  }): Promise<WorkflowExecutionResponse> {
    if (
      !hasOwnProp(this._mockData, 'retriggerInstanceInErrorResponse') ||
      !isNonNullable(this._mockData.retriggerInstanceInErrorResponse)
    ) {
      throw new Error(`[retriggerInstanceInError]: No mock data available`);
    }

    return this._mockData.retriggerInstanceInErrorResponse();
  }
}
