import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { JsonObject } from '@backstage/types';

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios';

import {
  AssessedProcessInstanceDTO,
  Configuration,
  DefaultApi,
  FilterInfo,
  PaginationInfoDTO,
  ProcessInstanceListResultDTO,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_BUSINESS_KEY,
  QUERY_PARAM_INSTANCE_ID,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInputSchemaResponse,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@backstage-community/plugin-orchestrator-common';

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

  async getDefaultAPI(): Promise<DefaultApi> {
    const baseUrl = await this.getBaseUrl();
    const { token: idToken } = await this.identityApi.getCredentials();

    const axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      withCredentials: true,
    });
    const config = new Configuration({
      basePath: baseUrl,
    });

    return new DefaultApi(config, baseUrl, axiosInstance);
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

  async listWorkflowOverviews(
    paginationInfo?: PaginationInfoDTO,
    filterInfo?: FilterInfo,
  ): Promise<AxiosResponse<WorkflowOverviewListResultDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    return await defaultApi.getWorkflowsOverview(
      { paginationInfo, filterInfo },
      reqConfigOption,
    );
  }

  async listInstances(args: {
    paginationInfo?: PaginationInfoDTO;
    filterInfo?: FilterInfo;
  }): Promise<AxiosResponse<ProcessInstanceListResultDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    return await defaultApi.getInstances(args, reqConfigOption);
  }

  async getInstance(
    instanceId: string,
    includeAssessment = false,
  ): Promise<AxiosResponse<AssessedProcessInstanceDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.getInstanceById(
        instanceId,
        includeAssessment,
        reqConfigOption,
      );
    } catch (error: any) {
      throw new Error(error);
    }
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

  async getWorkflowOverview(
    workflowId: string,
  ): Promise<AxiosResponse<WorkflowOverviewDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    return await defaultApi.getWorkflowOverviewById(
      workflowId,
      reqConfigOption,
    );
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

  // getDefaultReqConfig is a convenience wrapper that includes authentication and other necessary headers
  private async getDefaultReqConfig(
    additionalHeaders?: RawAxiosRequestHeaders,
  ): Promise<AxiosRequestConfig> {
    const idToken = await this.identityApi.getCredentials();
    const reqConfigOption: AxiosRequestConfig = {
      baseURL: await this.getBaseUrl(),
      headers: {
        Authorization: `Bearer ${idToken.token}`,
        ...additionalHeaders,
      },
    };
    return reqConfigOption;
  }
}
