import express from 'express';

import {
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowExecutionResponse,
} from '@backstage-community/plugin-orchestrator-common';

import { retryAsyncFunction } from '../Helper';
import { OrchestratorService } from '../OrchestratorService';

const FETCH_INSTANCE_MAX_ATTEMPTS = 10;
const FETCH_INSTANCE_RETRY_DELAY_MS = 1000;

export class V1 {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  public async getWorkflowById(
    definitionId: string,
  ): Promise<WorkflowDefinition> {
    const definition = await this.orchestratorService.fetchWorkflowDefinition({
      definitionId,
      cacheHandler: 'throw',
    });

    if (!definition) {
      throw new Error(`Couldn't fetch workflow definition for ${definitionId}`);
    }

    return definition;
  }

  public async getWorkflowSourceById(definitionId: string): Promise<string> {
    const source = await this.orchestratorService.fetchWorkflowSource({
      definitionId,
      cacheHandler: 'throw',
    });

    if (!source) {
      throw new Error(`Couldn't fetch workflow source for ${definitionId}`);
    }

    return source;
  }

  public async executeWorkflow(
    inputData: ProcessInstanceVariables,
    definitionId: string,
    businessKey: string | undefined,
  ): Promise<WorkflowExecutionResponse> {
    const definition = await this.orchestratorService.fetchWorkflowInfo({
      definitionId,
      cacheHandler: 'throw',
    });
    if (!definition) {
      throw new Error(`Couldn't fetch workflow definition for ${definitionId}`);
    }
    if (!definition.serviceUrl) {
      throw new Error(`ServiceURL is not defined for workflow ${definitionId}`);
    }
    const executionResponse = await this.orchestratorService.executeWorkflow({
      definitionId: definitionId,
      inputData,
      serviceUrl: definition.serviceUrl,
      businessKey,
      cacheHandler: 'throw',
    });

    if (!executionResponse) {
      throw new Error(`Couldn't execute workflow ${definitionId}`);
    }

    // Making sure the instance data is available before returning
    await retryAsyncFunction({
      asyncFn: () =>
        this.orchestratorService.fetchInstance({
          instanceId: executionResponse.id,
          cacheHandler: 'throw',
        }),
      maxAttempts: FETCH_INSTANCE_MAX_ATTEMPTS,
      delayMs: FETCH_INSTANCE_RETRY_DELAY_MS,
    });

    return executionResponse;
  }

  public async abortWorkflow(instanceId: string): Promise<void> {
    await this.orchestratorService.abortWorkflowInstance({
      instanceId,
      cacheHandler: 'throw',
    });
  }

  public async retriggerInstanceInError(
    instanceId: string,
    inputData: ProcessInstanceVariables,
  ): Promise<WorkflowExecutionResponse> {
    const instance = await this.orchestratorService.fetchInstance({
      instanceId,
      cacheHandler: 'throw',
    });

    if (!instance?.serviceUrl) {
      throw new Error(`Couldn't fetch process instance ${instanceId}`);
    }

    if (instance.state !== 'ERROR') {
      throw new Error(
        `Can't retrigger an instance on ${instance.state} state.`,
      );
    }

    const isUpdateInstanceInputDataOk =
      await this.orchestratorService.updateInstanceInputData({
        definitionId: instance.processId,
        instanceId,
        inputData,
        serviceUrl: instance.serviceUrl,
        cacheHandler: 'throw',
      });

    if (!isUpdateInstanceInputDataOk) {
      throw new Error(`Couldn't update instance input data for ${instanceId}`);
    }

    const isRetriggerInstanceInErrorOk =
      await this.orchestratorService.retriggerInstanceInError({
        definitionId: instance.processId,
        instanceId,
        serviceUrl: instance.serviceUrl,
        cacheHandler: 'throw',
      });

    if (!isRetriggerInstanceInErrorOk) {
      throw new Error(`Couldn't retrigger instance in error for ${instanceId}`);
    }

    return { id: instanceId };
  }

  public extractQueryParam(
    req: express.Request,
    key: string,
  ): string | undefined {
    return req.query[key] as string | undefined;
  }
}
