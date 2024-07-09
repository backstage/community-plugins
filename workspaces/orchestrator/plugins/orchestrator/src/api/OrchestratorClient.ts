import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { JsonObject } from '@backstage/types';

import {
  AssessedProcessInstance,
  ProcessInstance,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_BUSINESS_KEY,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  QUERY_PARAM_INSTANCE_ID,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInputSchemaResponse,
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { buildUrl } from '../utils/UrlUtils';
import { OrchestratorApi } from './api';

export interface OrchestratorClientOptions {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
}
export class OrchestratorClient implements OrchestratorApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  private baseUrl: string | null = null;
  constructor(options: OrchestratorClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  private async getBaseUrl(): Promise<string> {
    if (!this.baseUrl) {
      this.baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    }

    return this.baseUrl;
  }

  async executeWorkflow(args: {
    workflowId: string;
    parameters: JsonObject;
    businessKey?: string;
  }): Promise<WorkflowExecutionResponse> {
    const baseUrl = await this.getBaseUrl();
    const endpoint = `${baseUrl}/workflows/${args.workflowId}/execute`;
    const urlToFetch = buildUrl(endpoint, {
      [QUERY_PARAM_BUSINESS_KEY]: args.businessKey,
    });
    return await this.fetcher(urlToFetch, {
      method: 'POST',
      body: JSON.stringify(args.parameters),
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json());
  }

  async abortWorkflowInstance(instanceId: string): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    return await this.fetcher(`${baseUrl}/instances/${instanceId}/abort`, {
      method: 'DELETE',
    }).then(_ => undefined);
  }

  async getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition> {
    const baseUrl = await this.getBaseUrl();
    return await this.fetcher(`${baseUrl}/workflows/${workflowId}`).then(r =>
      r.json(),
    );
  }

  async getWorkflowSource(workflowId: string): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return await this.fetcher(`${baseUrl}/workflows/${workflowId}/source`).then(
      r => r.text(),
    );
  }

  async listWorkflowOverviews(): Promise<WorkflowOverviewListResult> {
    const baseUrl = await this.getBaseUrl();
    return await this.fetcher(`${baseUrl}/workflows/overview`).then(r =>
      r.json(),
    );
  }

  async listInstances(): Promise<ProcessInstance[]> {
    const baseUrl = await this.getBaseUrl();
    return await this.fetcher(`${baseUrl}/instances`).then(r => r.json());
  }

  async getInstance(
    instanceId: string,
    includeAssessment = false,
  ): Promise<AssessedProcessInstance> {
    const baseUrl = await this.getBaseUrl();
    const endpoint = `${baseUrl}/instances/${instanceId}`;
    const urlToFetch = buildUrl(endpoint, {
      [QUERY_PARAM_INCLUDE_ASSESSMENT]: includeAssessment,
    });
    return await this.fetcher(urlToFetch).then(r => r.json());
  }

  async getWorkflowDataInputSchema(args: {
    workflowId: string;
    instanceId?: string;
    assessmentInstanceId?: string;
  }): Promise<WorkflowInputSchemaResponse> {
    const baseUrl = await this.getBaseUrl();
    const endpoint = `${baseUrl}/workflows/${args.workflowId}/inputSchema`;
    const urlToFetch = buildUrl(endpoint, {
      [QUERY_PARAM_INSTANCE_ID]: args.instanceId,
      [QUERY_PARAM_ASSESSMENT_INSTANCE_ID]: args.assessmentInstanceId,
    });
    return await this.fetcher(urlToFetch).then(r => r.json());
  }

  async getWorkflowOverview(workflowId: string): Promise<WorkflowOverview> {
    const baseUrl = await this.getBaseUrl();
    return await this.fetcher(
      `${baseUrl}/workflows/${workflowId}/overview`,
    ).then(r => r.json());
  }

  async retriggerInstanceInError(args: {
    instanceId: string;
    inputData: JsonObject;
  }): Promise<WorkflowExecutionResponse> {
    const baseUrl = await this.getBaseUrl();
    const urlToFetch = `${baseUrl}/instances/${args.instanceId}/retrigger`;
    return await this.fetcher(urlToFetch, {
      method: 'POST',
      body: JSON.stringify(args.inputData),
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json());
  }

  /** fetcher is convenience fetch wrapper that includes authentication
   * and other necessary headers **/
  private async fetcher(
    url: string,
    requestInit?: RequestInit,
  ): Promise<Response> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const r = { ...requestInit };
    r.headers = {
      ...r.headers,
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    };
    const response = await fetch(url, r);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response;
  }
}
