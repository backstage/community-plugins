import {
  ProcessInstance,
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowOverview,
} from '@backstage-community/plugin-orchestrator-common';

import { Pagination } from '../types/pagination';
import { DataIndexService } from './DataIndexService';
import { SonataFlowService } from './SonataFlowService';
import { CacheHandler, WorkflowCacheService } from './WorkflowCacheService';

export class OrchestratorService {
  constructor(
    private readonly sonataFlowService: SonataFlowService,
    private readonly dataIndexService: DataIndexService,
    private readonly workflowCacheService: WorkflowCacheService,
  ) {}

  // Data Index Service Wrapper

  public async abortWorkflowInstance(args: {
    instanceId: string;
    cacheHandler?: CacheHandler;
  }): Promise<void> {
    const { instanceId, cacheHandler } = args;
    const definitionId =
      await this.dataIndexService.fetchDefinitionIdByInstanceId(instanceId);
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.dataIndexService.abortWorkflowInstance(instanceId)
      : undefined;
  }

  public async fetchWorkflowInfo(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowInfo | undefined> {
    const { definitionId, cacheHandler } = args;
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.dataIndexService.fetchWorkflowInfo(definitionId)
      : undefined;
  }

  public async fetchInstances(args: {
    pagination?: Pagination;
  }): Promise<ProcessInstance[]> {
    return await this.dataIndexService.fetchInstances({
      definitionIds: this.workflowCacheService.definitionIds,
      pagination: args.pagination,
    });
  }

  public async fetchInstancesTotalCount(): Promise<number> {
    return await this.dataIndexService.fetchInstancesTotalCount(
      this.workflowCacheService.definitionIds,
    );
  }

  public async fetchWorkflowSource(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<string | undefined> {
    const { definitionId, cacheHandler } = args;
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.dataIndexService.fetchWorkflowSource(definitionId)
      : undefined;
  }

  public async fetchInstanceVariables(args: {
    instanceId: string;
    cacheHandler?: CacheHandler;
  }): Promise<ProcessInstanceVariables | undefined> {
    const { instanceId, cacheHandler } = args;
    const definitionId =
      await this.dataIndexService.fetchDefinitionIdByInstanceId(instanceId);
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.dataIndexService.fetchInstanceVariables(instanceId)
      : undefined;
  }

  public async fetchInstance(args: {
    instanceId: string;
    cacheHandler?: CacheHandler;
  }): Promise<ProcessInstance | undefined> {
    const { instanceId, cacheHandler } = args;
    const instance = await this.dataIndexService.fetchInstance(instanceId);
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      instance?.processId,
      cacheHandler,
    );
    return isWorkflowAvailable ? instance : undefined;
  }

  // SonataFlow Service Wrapper

  public async fetchWorkflowInfoOnService(args: {
    definitionId: string;
    serviceUrl: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowInfo | undefined> {
    const { definitionId, cacheHandler } = args;
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.sonataFlowService.fetchWorkflowInfoOnService(args)
      : undefined;
  }

  public async fetchWorkflowDefinition(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowDefinition | undefined> {
    const { definitionId, cacheHandler } = args;
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.sonataFlowService.fetchWorkflowDefinition(definitionId)
      : undefined;
  }

  public async fetchWorkflowOverviews(args: {
    pagination?: Pagination;
  }): Promise<WorkflowOverview[] | undefined> {
    return await this.sonataFlowService.fetchWorkflowOverviews({
      definitionIds: this.workflowCacheService.definitionIds,
      pagination: args.pagination,
    });
  }

  public async executeWorkflow(args: {
    definitionId: string;
    serviceUrl: string;
    inputData: ProcessInstanceVariables;
    businessKey?: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowExecutionResponse | undefined> {
    const { definitionId, cacheHandler } = args;
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.sonataFlowService.executeWorkflow(args)
      : undefined;
  }

  public async fetchWorkflowOverview(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowOverview | undefined> {
    const { definitionId, cacheHandler } = args;
    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );
    return isWorkflowAvailable
      ? await this.sonataFlowService.fetchWorkflowOverview(definitionId)
      : undefined;
  }

  public async retriggerInstanceInError(args: {
    definitionId: string;
    serviceUrl: string;
    instanceId: string;
    cacheHandler?: CacheHandler;
  }): Promise<boolean> {
    const { definitionId, cacheHandler } = args;

    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );

    return isWorkflowAvailable
      ? await this.sonataFlowService.retriggerInstanceInError(args)
      : false;
  }

  public async updateInstanceInputData(args: {
    definitionId: string;
    serviceUrl: string;
    instanceId: string;
    inputData: ProcessInstanceVariables;
    cacheHandler?: CacheHandler;
  }): Promise<boolean> {
    const { definitionId, cacheHandler } = args;

    const isWorkflowAvailable = this.workflowCacheService.isAvailable(
      definitionId,
      cacheHandler,
    );

    return isWorkflowAvailable
      ? await this.sonataFlowService.updateInstanceInputData(args)
      : false;
  }
}
