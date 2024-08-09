import { ProcessInstance } from '@backstage-community/plugin-orchestrator-common';

import { OrchestratorService } from '../OrchestratorService';
import { V1 } from './v1';

// Mocked data
const inputData = {};

// Mocked data helpers
const createInstance = (args: Partial<ProcessInstance>): ProcessInstance => ({
  id: args.id || 'instanceId',
  processId: args.processId || 'processId',
  state: args.state || 'ACTIVE',
  serviceUrl: args.serviceUrl || 'http://localhost',
  endpoint: args.endpoint || 'http://localhost',
  nodes: args.nodes || [],
});

// Mocked dependencies
const orchestratorServiceMock = {} as OrchestratorService;
orchestratorServiceMock.fetchInstance = jest.fn();
orchestratorServiceMock.updateInstanceInputData = jest.fn();
orchestratorServiceMock.retriggerInstanceInError = jest.fn();

// Target
const v1 = new V1(orchestratorServiceMock);

describe('retriggerInstanceInError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrigger an instance in error state', async () => {
    const instance = createInstance({ state: 'ERROR' });

    orchestratorServiceMock.fetchInstance = jest
      .fn()
      .mockResolvedValue(instance);
    orchestratorServiceMock.updateInstanceInputData = jest
      .fn()
      .mockResolvedValue(true);
    orchestratorServiceMock.retriggerInstanceInError = jest
      .fn()
      .mockResolvedValue(true);

    const response = await v1.retriggerInstanceInError(instance.id, inputData);

    expect(response).toStrictEqual({ id: instance.id });
    expect(orchestratorServiceMock.fetchInstance).toHaveBeenCalled();
    expect(orchestratorServiceMock.updateInstanceInputData).toHaveBeenCalled();
    expect(orchestratorServiceMock.retriggerInstanceInError).toHaveBeenCalled();
  });

  it('should throw an error if the instance is not found', async () => {
    orchestratorServiceMock.fetchInstance = jest
      .fn()
      .mockResolvedValue(undefined);

    const promise = v1.retriggerInstanceInError('unknown', inputData);

    await expect(promise).rejects.toThrow();

    expect(orchestratorServiceMock.fetchInstance).toHaveBeenCalled();
    expect(
      orchestratorServiceMock.updateInstanceInputData,
    ).not.toHaveBeenCalled();
    expect(
      orchestratorServiceMock.retriggerInstanceInError,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error if instance is not in error state', async () => {
    const instance = createInstance({ state: 'ACTIVE' });

    orchestratorServiceMock.fetchInstance = jest
      .fn()
      .mockResolvedValue(instance);

    const promise = v1.retriggerInstanceInError(instance.id, inputData);

    await expect(promise).rejects.toThrow();

    expect(orchestratorServiceMock.fetchInstance).toHaveBeenCalled();
    expect(
      orchestratorServiceMock.updateInstanceInputData,
    ).not.toHaveBeenCalled();
    expect(
      orchestratorServiceMock.retriggerInstanceInError,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error if could not update the instance input data', async () => {
    const instance = createInstance({ state: 'ERROR' });

    orchestratorServiceMock.fetchInstance = jest
      .fn()
      .mockResolvedValue(instance);
    orchestratorServiceMock.updateInstanceInputData = jest
      .fn()
      .mockResolvedValue(false);

    const promise = v1.retriggerInstanceInError(instance.id, inputData);

    await expect(promise).rejects.toThrow();

    expect(orchestratorServiceMock.fetchInstance).toHaveBeenCalled();
    expect(orchestratorServiceMock.updateInstanceInputData).toHaveBeenCalled();
    expect(
      orchestratorServiceMock.retriggerInstanceInError,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error if could not retrigger the instance', async () => {
    const instance = createInstance({ state: 'ERROR' });

    orchestratorServiceMock.fetchInstance = jest
      .fn()
      .mockResolvedValue(instance);
    orchestratorServiceMock.updateInstanceInputData = jest
      .fn()
      .mockResolvedValue(true);
    orchestratorServiceMock.retriggerInstanceInError = jest
      .fn()
      .mockResolvedValue(false);

    const promise = v1.retriggerInstanceInError(instance.id, inputData);

    await expect(promise).rejects.toThrow();

    expect(orchestratorServiceMock.fetchInstance).toHaveBeenCalled();
    expect(orchestratorServiceMock.updateInstanceInputData).toHaveBeenCalled();
    expect(orchestratorServiceMock.retriggerInstanceInError).toHaveBeenCalled();
  });
});
