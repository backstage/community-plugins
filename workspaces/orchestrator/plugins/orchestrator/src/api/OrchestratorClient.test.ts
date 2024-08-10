import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  RawAxiosResponseHeaders,
} from 'axios';

import {
  AssessedProcessInstanceDTO,
  DefaultApi,
  PaginationInfoDTO,
  ProcessInstanceListResultDTO,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  WorkflowExecutionResponse,
  WorkflowFormatDTO,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@backstage-community/plugin-orchestrator-common';

import {
  OrchestratorClient,
  OrchestratorClientOptions,
} from './OrchestratorClient';

jest.mock('axios');

describe('OrchestratorClient', () => {
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let mockIdentityApi: jest.Mocked<IdentityApi>;
  let orchestratorClientOptions: jest.Mocked<OrchestratorClientOptions>;
  let orchestratorClient: OrchestratorClient;
  const baseUrl = 'https://api.example.com';
  const mockToken = 'test-token';
  const defaultAuthHeaders = { Authorization: `Bearer ${mockToken}` };

  const mockFetch = jest.fn();
  (global as any).fetch = mockFetch; // Cast global to any to avoid TypeScript errors

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock DiscoveryApi with a mocked implementation of getBaseUrl
    mockDiscoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
    } as jest.Mocked<DiscoveryApi>;
    mockIdentityApi = {
      getCredentials: jest.fn().mockResolvedValue({ token: mockToken }),
      getProfileInfo: jest
        .fn()
        .mockResolvedValue({ displayName: 'test', email: 'test@test' }),
      getBackstageIdentity: jest
        .fn()
        .mockResolvedValue({ userEntityRef: 'default/test' }),
      signOut: jest.fn().mockImplementation(),
    } as jest.Mocked<IdentityApi>;

    // Create OrchestratorClientOptions with the mocked DiscoveryApi
    orchestratorClientOptions = {
      discoveryApi: mockDiscoveryApi,
      identityApi: mockIdentityApi,
    };
    orchestratorClient = new OrchestratorClient(orchestratorClientOptions);
  });

  describe('executeWorkflow', () => {
    it('should execute workflow with empty parameters', async () => {
      // Given
      const workflowId = 'workflow123';
      const executionId = 'execId001';
      const parameters: JsonObject = {};
      const args = {
        workflowId: workflowId,
        parameters: {} as JsonObject,
      };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: executionId,
        }),
      });

      // When
      const result: WorkflowExecutionResponse =
        await orchestratorClient.executeWorkflow(args);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/${workflowId}/execute`,
        {
          method: 'POST',
          body: JSON.stringify(parameters),
          headers: {
            'Content-Type': 'application/json',
            ...defaultAuthHeaders,
          },
        },
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toEqual(executionId);
    });
    it('should execute workflow with business key', async () => {
      // Given
      const workflowId = 'workflow123';
      const businessKey = 'business123';
      const executionId = 'execId001';
      const parameters: JsonObject = {};
      const args = {
        workflowId: workflowId,
        parameters: {} as JsonObject,
        businessKey: businessKey,
      };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: executionId,
        }),
      });

      // When
      const client = new OrchestratorClient(orchestratorClientOptions);
      const result: WorkflowExecutionResponse = await client.executeWorkflow(
        args,
      );

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/${workflowId}/execute?businessKey=${businessKey}`,
        {
          method: 'POST',
          body: JSON.stringify(parameters),
          headers: {
            'Content-Type': 'application/json',
            ...defaultAuthHeaders,
          },
        },
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toEqual(executionId);
    });
    it('should execute workflow with parameters and business key', async () => {
      // Given
      const workflowId = 'workflow123';
      const businessKey = 'business123';
      const executionId = 'execId001';
      const parameters: JsonObject = {
        param1: 'one',
        param2: 2,
        param3: true,
      };
      const args = {
        workflowId: workflowId,
        parameters: parameters,
        businessKey: businessKey,
      };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: executionId,
        }),
      });

      // When
      const client = new OrchestratorClient(orchestratorClientOptions);
      const result: WorkflowExecutionResponse = await client.executeWorkflow(
        args,
      );

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/${workflowId}/execute?businessKey=${businessKey}`,
        {
          method: 'POST',
          body: JSON.stringify(parameters),
          headers: {
            'Content-Type': 'application/json',
            ...defaultAuthHeaders,
          },
        },
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toEqual(executionId);
    });
  });
  describe('abortWorkflow', () => {
    it('should abort a workflow instance successfully', async () => {
      // Given
      const instanceId = 'instance123';

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // When
      await orchestratorClient.abortWorkflowInstance(instanceId);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/instances/${instanceId}/abort`,
        {
          method: 'DELETE',
          headers: defaultAuthHeaders,
        },
      );
    });

    it('should throw a ResponseError if aborting the workflow instance fails', async () => {
      // Given
      const instanceId = 'instance123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // When
      const promise = orchestratorClient.abortWorkflowInstance(instanceId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getWorkflowDefinition', () => {
    it('should return a workflow definition when successful', async () => {
      // Given
      const workflowId = 'workflow123';
      const mockWorkflowDefinition = { id: workflowId, name: 'Workflow 1' };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockWorkflowDefinition),
      });

      // When
      const result = await orchestratorClient.getWorkflowDefinition(workflowId);

      // Then
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/workflows/${workflowId}`, {
        headers: defaultAuthHeaders,
      });
      expect(result).toEqual(mockWorkflowDefinition);
    });

    it('should throw a ResponseError when fetching the workflow definition fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // When
      const promise = orchestratorClient.getWorkflowDefinition(workflowId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getWorkflowSource', () => {
    it('should return workflow source when successful', async () => {
      // Given
      const workflowId = 'workflow123';
      const mockWorkflowSource = 'test workflow source';

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockWorkflowSource),
      });

      // When
      const result = await orchestratorClient.getWorkflowSource(workflowId);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/${workflowId}/source`,
        { headers: defaultAuthHeaders },
      );
      expect(result).toEqual(mockWorkflowSource);
    });

    it('should throw a ResponseError when fetching the workflow source fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // When
      const promise = orchestratorClient.getWorkflowSource(workflowId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('listWorkflowOverviews', () => {
    it('should return workflow overviews when successful', async () => {
      // Given
      const paginationInfo: PaginationInfoDTO = {
        offset: 1,
        pageSize: 5,
        orderBy: 'name',
        orderDirection: 'ASC',
      };
      const mockWorkflowOverviews: WorkflowOverviewListResultDTO = {
        overviews: [
          {
            workflowId: 'workflow123',
            name: 'Workflow 1',
            format: WorkflowFormatDTO.Yaml,
          },
          {
            workflowId: 'workflow456',
            name: 'Workflow 2',
            format: WorkflowFormatDTO.Yaml,
          },
        ],
        paginationInfo: paginationInfo,
      };

      const mockResponse: AxiosResponse<WorkflowOverviewListResultDTO> = {
        data: mockWorkflowOverviews,
        status: 200, // Set status code (optional)
        statusText: 'OK', // Set status text (optional)
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      // Spy DefaultApi
      const getWorkflowsOverviewSpy = jest.spyOn(
        DefaultApi.prototype,
        'getWorkflowsOverview',
      );

      // Mock axios request to simulate a successful response
      axios.request = jest.fn().mockResolvedValueOnce(mockResponse);

      // When
      const result = await orchestratorClient.listWorkflowOverviews(
        paginationInfo,
      );

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockWorkflowOverviews);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith({
        ...getAxiosTestRequest('v2/workflows/overview'),
        data: JSON.stringify({ paginationInfo }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultAuthHeaders,
        },
      });
      expect(getWorkflowsOverviewSpy).toHaveBeenCalledTimes(1);
      expect(getWorkflowsOverviewSpy).toHaveBeenCalledWith(
        { paginationInfo },
        getDefaultTestRequestConfig(),
      );
    });
    it('should throw a ResponseError when listing workflow overviews fails', async () => {
      // Given

      // Mock fetch to simulate a failure
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));
      // When
      const promise = orchestratorClient.listWorkflowOverviews();

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('listInstances', () => {
    it('should return instances when successful', async () => {
      // Given
      const paginationInfo: PaginationInfoDTO = {
        offset: 1,
        pageSize: 5,
        orderBy: 'name',
        orderDirection: 'ASC',
      };

      const mockInstances: ProcessInstanceListResultDTO = {
        items: [{ id: 'instance123', processId: 'process001', nodes: [] }],
        paginationInfo,
      };

      const mockResponse: AxiosResponse<ProcessInstanceListResultDTO> = {
        data: mockInstances,
        status: 200, // Set status code (optional)
        statusText: 'OK', // Set status text (optional)
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      // Spy DefaultApi
      const getInstancesSpy = jest.spyOn(DefaultApi.prototype, 'getInstances');

      // Mock axios request to simulate a successful response
      axios.request = jest.fn().mockResolvedValueOnce(mockResponse);

      // When
      const result = await orchestratorClient.listInstances({ paginationInfo });
      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockInstances);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith({
        ...getAxiosTestRequest('v2/workflows/instances'),
        data: JSON.stringify({ paginationInfo }),
        headers: {
          'Content-Type': 'application/json',
          ...defaultAuthHeaders,
        },
        method: 'POST',
      });
      expect(getInstancesSpy).toHaveBeenCalledTimes(1);
      expect(getInstancesSpy).toHaveBeenCalledWith(
        { paginationInfo },
        getDefaultTestRequestConfig(),
      );
    });

    it('should throw a ResponseError when listing instances fails', async () => {
      // Given
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));
      // When
      const promise = orchestratorClient.listInstances({});

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getInstance', () => {
    it('should return instance when successful', async () => {
      // Given
      const instanceId = 'instance123';
      const instanceIdParent = 'instance000';
      const includeAssessment = false;
      const mockInstance: AssessedProcessInstanceDTO = {
        instance: { id: instanceId, processId: 'process002', nodes: [] },
        assessedBy: {
          id: instanceIdParent,
          processId: 'process001',
          nodes: [],
        },
      };

      const mockResponse: AxiosResponse<AssessedProcessInstanceDTO> = {
        data: mockInstance,
        status: 200, // Set status code (optional)
        statusText: 'OK', // Set status text (optional)
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };
      // Mock axios request to simulate a successful response
      axios.request = jest.fn().mockResolvedValueOnce(mockResponse);

      // Spy DefaultApi
      const getInstanceSpy = jest.spyOn(
        DefaultApi.prototype,
        'getInstanceById',
      );
      // When
      const result = await orchestratorClient.getInstance(
        instanceId,
        includeAssessment,
      );

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockInstance);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith(
        getAxiosTestRequest(
          `v2/workflows/instances/${instanceId}`,
          includeAssessment,
        ),
      );
      expect(getInstanceSpy).toHaveBeenCalledTimes(1);
      expect(getInstanceSpy).toHaveBeenCalledWith(
        instanceId,
        includeAssessment,
        getDefaultTestRequestConfig(),
      );
    });

    it('should throw a ResponseError when fetching the instance fails', async () => {
      // Given
      const instanceId = 'instance123';

      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));
      // When
      const promise = orchestratorClient.getInstance(instanceId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getWorkflowDataInputSchema', () => {
    it('should return workflow input schema when successful', async () => {
      // Given
      const workflowId = 'workflow123';
      const instanceId = 'instance123';
      const assessmentInstanceId = 'assessment123';
      const mockInputSchema = { id: 'schemaId', name: 'schemaName' };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockInputSchema),
      });

      // When
      const result = await orchestratorClient.getWorkflowDataInputSchema({
        workflowId,
        instanceId,
        assessmentInstanceId,
      });

      // Then
      const expectedEndpoint = `${baseUrl}/workflows/${workflowId}/inputSchema?instanceId=${instanceId}&assessmentInstanceId=${assessmentInstanceId}`;

      expect(fetch).toHaveBeenCalledWith(expectedEndpoint, {
        headers: defaultAuthHeaders,
      });
      expect(result).toEqual(mockInputSchema);
    });

    it('should throw a ResponseError when fetching the workflow input schema fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // When
      const promise = orchestratorClient.getWorkflowDataInputSchema({
        workflowId,
      });

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getWorkflowOverview', () => {
    it('should return workflow overview when successful', async () => {
      // Given
      const workflowId = 'workflow123';
      const mockOverview = {
        workflowId: workflowId,
        name: 'Workflow 1',
        format: WorkflowFormatDTO.Yaml,
      };

      const mockResponse: AxiosResponse<WorkflowOverviewDTO> = {
        data: mockOverview,
        status: 200, // Set status code (optional)
        statusText: 'OK', // Set status text (optional)
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      // Spy DefaultApi
      const getWorkflowOverviewByIdSpy = jest.spyOn(
        DefaultApi.prototype,
        'getWorkflowOverviewById',
      );

      // Mock axios request to simulate a successful response
      axios.request = jest.fn().mockResolvedValueOnce(mockResponse);

      // When
      const result = await orchestratorClient.getWorkflowOverview(workflowId);

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockOverview);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith(
        getAxiosTestRequest(`v2/workflows/${workflowId}/overview`),
      );
      expect(getWorkflowOverviewByIdSpy).toHaveBeenCalledTimes(1);
      expect(getWorkflowOverviewByIdSpy).toHaveBeenCalledWith(
        workflowId,
        getDefaultTestRequestConfig(),
      );
    });

    it('should throw a ResponseError when fetching the workflow overview fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Given
      // Mock fetch to simulate a failure
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));

      // When
      const promise = orchestratorClient.getWorkflowOverview(workflowId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('retriggerInstanceInError', () => {
    it('should retrigger instance when successful', async () => {
      // Given
      const instanceId = 'instance123';
      const inputData = { key: 'value' };
      const mockResponse = { id: 'newInstanceId', status: 'running' };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      // When
      const result = await orchestratorClient.retriggerInstanceInError({
        instanceId,
        inputData,
      });

      // Then
      const expectedUrlToFetch = `${baseUrl}/instances/${instanceId}/retrigger`;
      expect(fetch).toHaveBeenCalledWith(expectedUrlToFetch, {
        method: 'POST',
        body: JSON.stringify(inputData),
        headers: { 'Content-Type': 'application/json', ...defaultAuthHeaders },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw a ResponseError when retriggering instance fails', async () => {
      // Given
      const instanceId = 'instance123';
      const inputData = { key: 'value' };

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // When
      const promise = orchestratorClient.retriggerInstanceInError({
        instanceId,
        inputData,
      });

      // Then
      await expect(promise).rejects.toThrow();
    });
  });

  function getDefaultTestRequestConfig(): AxiosRequestConfig {
    return {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${mockToken}` },
    };
  }

  function getAxiosTestRequest(
    endpoint: string,
    includeAssessment?: boolean,
    paginationInfo?: PaginationInfoDTO,
    method: string = 'GET',
  ): AxiosRequestConfig {
    const req = getDefaultTestRequestConfig();

    return {
      ...req,
      method,
      url: buildURLWithPagination(endpoint, includeAssessment, paginationInfo),
    };
  }

  function buildURLWithPagination(
    endpoint: string,
    includeAssessment?: boolean,
    paginationInfo?: PaginationInfoDTO,
  ): string {
    const url = new URL(endpoint, baseUrl);
    if (includeAssessment !== undefined) {
      url.searchParams.append(
        QUERY_PARAM_INCLUDE_ASSESSMENT,
        String(includeAssessment),
      );
    }
    if (paginationInfo?.offset !== undefined) {
      url.searchParams.append('page', paginationInfo.offset.toString());
    }

    if (paginationInfo?.pageSize !== undefined) {
      url.searchParams.append('pageSize', paginationInfo.pageSize.toString());
    }

    if (paginationInfo?.orderBy !== undefined) {
      url.searchParams.append('orderBy', paginationInfo.orderBy);
    }

    if (paginationInfo?.orderDirection !== undefined) {
      url.searchParams.append('orderDirection', paginationInfo.orderDirection);
    }
    return url.toString();
  }
});
