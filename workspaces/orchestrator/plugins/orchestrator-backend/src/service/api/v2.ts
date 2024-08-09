import { ParsedRequest } from 'openapi-backend';

import {
  AssessedProcessInstanceDTO,
  ExecuteWorkflowRequestDTO,
  ExecuteWorkflowResponseDTO,
  FilterInfo,
  ProcessInstance,
  ProcessInstanceListResultDTO,
  ProcessInstanceState,
  WorkflowDTO,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
  WorkflowRunStatusDTO,
} from '@backstage-community/plugin-orchestrator-common';

import { Pagination } from '../../types/pagination';
import { OrchestratorService } from '../OrchestratorService';
import {
  mapToExecuteWorkflowResponseDTO,
  mapToProcessInstanceDTO,
  mapToWorkflowDTO,
  mapToWorkflowOverviewDTO,
  mapToWorkflowRunStatusDTO,
} from './mapping/V2Mappings';
import { V1 } from './v1';

export class V2 {
  constructor(
    private readonly orchestratorService: OrchestratorService,
    private readonly v1: V1,
  ) {}

  public async getWorkflowsOverview(
    pagination: Pagination,
    filter?: FilterInfo,
  ): Promise<WorkflowOverviewListResultDTO> {
    const overviews = await this.orchestratorService.fetchWorkflowOverviews({
      pagination,
      filter,
    });
    if (!overviews) {
      throw new Error("Couldn't fetch workflow overviews");
    }
    const result: WorkflowOverviewListResultDTO = {
      overviews: overviews.map(item => mapToWorkflowOverviewDTO(item)),
      paginationInfo: {
        pageSize: pagination.limit,
        offset: pagination.offset,
        totalCount: overviews.length,
      },
    };
    return result;
  }

  public async getWorkflowOverviewById(
    workflowId: string,
  ): Promise<WorkflowOverviewDTO> {
    const overview = await this.orchestratorService.fetchWorkflowOverview({
      definitionId: workflowId,
      cacheHandler: 'throw',
    });

    if (!overview) {
      throw new Error(`Couldn't fetch workflow overview for ${workflowId}`);
    }
    return mapToWorkflowOverviewDTO(overview);
  }

  public async getWorkflowById(workflowId: string): Promise<WorkflowDTO> {
    const resultV1 = await this.v1.getWorkflowSourceById(workflowId);
    return mapToWorkflowDTO(resultV1);
  }

  public async getWorkflowSourceById(workflowId: string): Promise<string> {
    const resultV1 = await this.v1.getWorkflowSourceById(workflowId);
    return resultV1;
  }

  public async getInstances(
    pagination?: Pagination,
    filter?: FilterInfo,
  ): Promise<ProcessInstanceListResultDTO> {
    const instances = await this.orchestratorService.fetchInstances({
      pagination,
      filter,
    });
    const totalCount =
      await this.orchestratorService.fetchInstancesTotalCount();

    const result: ProcessInstanceListResultDTO = {
      items: instances?.map(mapToProcessInstanceDTO),
      paginationInfo: {
        pageSize: pagination?.limit,
        offset: pagination?.offset,
        totalCount: totalCount,
      },
    };
    return result;
  }

  public async getInstanceById(
    instanceId: string,
    includeAssessment: boolean = false,
  ): Promise<AssessedProcessInstanceDTO> {
    const instance = await this.orchestratorService.fetchInstance({
      instanceId,
      cacheHandler: 'throw',
    });

    if (!instance) {
      throw new Error(`Couldn't fetch process instance ${instanceId}`);
    }

    let assessedByInstance: ProcessInstance | undefined;

    if (includeAssessment && instance.businessKey) {
      assessedByInstance = await this.orchestratorService.fetchInstance({
        instanceId: instance.businessKey,
        cacheHandler: 'throw',
      });
    }

    return {
      instance: mapToProcessInstanceDTO(instance),
      assessedBy: assessedByInstance
        ? mapToProcessInstanceDTO(assessedByInstance)
        : undefined,
    };
  }

  public async executeWorkflow(
    executeWorkflowRequestDTO: ExecuteWorkflowRequestDTO,
    workflowId: string,
    businessKey: string | undefined,
  ): Promise<ExecuteWorkflowResponseDTO> {
    if (Object.keys(executeWorkflowRequestDTO?.inputData).length === 0) {
      throw new Error(
        `ExecuteWorkflowRequestDTO.inputData is required for executing workflow with id ${workflowId}`,
      );
    }

    const executeWorkflowResponse = await this.v1.executeWorkflow(
      executeWorkflowRequestDTO as unknown as Record<string, unknown>, // Temporary fix: this will be addresses in the next PR
      workflowId,
      businessKey,
    );

    if (!executeWorkflowResponse) {
      throw new Error('Error executing workflow with id ${workflowId}');
    }

    return mapToExecuteWorkflowResponseDTO(workflowId, executeWorkflowResponse);
  }

  public async abortWorkflow(instanceId: string): Promise<string> {
    await this.v1.abortWorkflow(instanceId);
    return `Workflow instance ${instanceId} successfully aborted`;
  }

  public async getWorkflowStatuses(): Promise<WorkflowRunStatusDTO[]> {
    return [
      ProcessInstanceState.Active,
      ProcessInstanceState.Error,
      ProcessInstanceState.Completed,
      ProcessInstanceState.Aborted,
      ProcessInstanceState.Suspended,
      ProcessInstanceState.Pending,
    ].map(status => mapToWorkflowRunStatusDTO(status));
  }

  public extractQueryParam(
    req: ParsedRequest,
    key: string,
  ): string | undefined {
    return req.query[key] as string | undefined;
  }
}
