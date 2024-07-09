import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { WorkflowExecutionResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import {
  OrchestratorClient,
  OrchestratorClientOptions,
} from './OrchestratorClient';

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
      getBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
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
      const result: WorkflowExecutionResponse =
        await client.executeWorkflow(args);

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
      const result: WorkflowExecutionResponse =
        await client.executeWorkflow(args);

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
      const mockWorkflowOverviews = [
        { id: 'workflow123', name: 'Workflow 1' },
        { id: 'workflow456', name: 'Workflow 2' },
      ];

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockWorkflowOverviews),
      });

      // When
      const result = await orchestratorClient.listWorkflowOverviews();

      // Then
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/workflows/overview`, {
        headers: defaultAuthHeaders,
      });
      expect(result).toEqual(mockWorkflowOverviews);
    });

    it('should throw a ResponseError when listing workflow overviews fails', async () => {
      // Given

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // When
      const promise = orchestratorClient.listWorkflowOverviews();

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('listInstances', () => {
    it('should return instances when successful', async () => {
      // Given
      const mockInstances = [{ id: 'instance123', name: 'Instance 1' }];

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockInstances),
      });

      // When
      const result = await orchestratorClient.listInstances();

      // Then
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/instances`, {
        headers: defaultAuthHeaders,
      });
      expect(result).toEqual(mockInstances);
    });

    it('should throw a ResponseError when listing instances fails', async () => {
      // Given
      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // When
      const promise = orchestratorClient.listInstances();

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getInstance', () => {
    it('should return instance when successful', async () => {
      // Given
      const instanceId = 'instance123';
      const includeAssessment = false;
      const mockInstance = { id: instanceId, name: 'Instance 1' };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockInstance),
      });

      // When
      const result = await orchestratorClient.getInstance(
        instanceId,
        includeAssessment,
      );

      // Then
      const expectedEndpoint = `${baseUrl}/instances/${instanceId}?includeAssessment=${includeAssessment}`;

      expect(fetch).toHaveBeenCalledWith(expectedEndpoint, {
        headers: defaultAuthHeaders,
      });
      expect(result).toEqual(mockInstance);
    });

    it('should throw a ResponseError when fetching the instance fails', async () => {
      // Given
      const instanceId = 'instance123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

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
      const mockOverview = { id: workflowId, name: 'Workflow 1' };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOverview),
      });

      // When
      const result = await orchestratorClient.getWorkflowOverview(workflowId);

      // Then
      const expectedEndpoint = `${baseUrl}/workflows/${workflowId}/overview`;
      expect(fetch).toHaveBeenCalledWith(expectedEndpoint, {
        headers: defaultAuthHeaders,
      });
      expect(result).toEqual(mockOverview);
    });

    it('should throw a ResponseError when fetching the workflow overview fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

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
});
