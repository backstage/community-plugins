import { ParsedRequest } from 'openapi-backend';

import {
  AssessedProcessInstance,
  AssessedProcessInstanceDTO,
  ExecuteWorkflowRequestDTO,
  ExecuteWorkflowResponseDTO,
  ProcessInstanceListResultDTO,
  ProcessInstanceState,
  WorkflowDataDTO,
  WorkflowDTO,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
  WorkflowRunStatusDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../../types/pagination';
import { OrchestratorService } from '../OrchestratorService';
import {
  mapToExecuteWorkflowResponseDTO,
  mapToGetWorkflowInstanceResults,
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
  ): Promise<WorkflowOverviewListResultDTO> {
    const overviews = await this.orchestratorService.fetchWorkflowOverviews({
      pagination,
    });
    if (!overviews) {
      throw new Error("Couldn't fetch workflow overviews");
    }
    const result: WorkflowOverviewListResultDTO = {
      overviews: overviews.map(item => mapToWorkflowOverviewDTO(item)),
      paginationInfo: {
        pageSize: pagination.limit,
        page: pagination.offset,
        totalCount: overviews.length,
      },
    };
    return result;
  }

  public async getWorkflowOverviewById(
    workflowId: string,
  ): Promise<WorkflowOverviewDTO> {
    const overviewV1 = await this.v1.getWorkflowOverviewById(workflowId);

    if (!overviewV1) {
      throw new Error(`Couldn't fetch workflow overview for ${workflowId}`);
    }
    return mapToWorkflowOverviewDTO(overviewV1);
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
    pagination: Pagination,
  ): Promise<ProcessInstanceListResultDTO> {
    const instances = await this.orchestratorService.fetchInstances({
      pagination,
    });
    const totalCount =
      await this.orchestratorService.fetchInstancesTotalCount();

    const result: ProcessInstanceListResultDTO = {
      items: instances?.map(mapToProcessInstanceDTO),
      paginationInfo: {
        pageSize: pagination.limit,
        page: pagination.offset,
        totalCount: totalCount,
      },
    };
    return result;
  }

  public async getInstanceById(
    instanceId: string,
    includeAssessment: boolean = false,
  ): Promise<AssessedProcessInstanceDTO> {
    const instance: AssessedProcessInstance = await this.v1.getInstanceById(
      instanceId,
      includeAssessment,
    );

    if (!instance) {
      throw new Error(`Couldn't fetch process instance ${instanceId}`);
    }

    return {
      instance: mapToProcessInstanceDTO(instance.instance),
      assessedBy: instance.assessedBy
        ? mapToProcessInstanceDTO(instance.assessedBy)
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
      executeWorkflowRequestDTO,
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

  public async getWorkflowResults(
    instanceId: string,
    includeAssessment: boolean = false,
  ): Promise<WorkflowDataDTO> {
    if (!instanceId) {
      throw new Error(`No instance id was provided to get workflow results`);
    }

    const instanceResult = await this.v1.getInstanceById(
      instanceId,
      includeAssessment,
    );

    if (!instanceResult.instance?.variables) {
      throw new Error(
        `Error getting workflow instance results with id ${instanceId}`,
      );
    }

    return mapToGetWorkflowInstanceResults(instanceResult.instance.variables);
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
