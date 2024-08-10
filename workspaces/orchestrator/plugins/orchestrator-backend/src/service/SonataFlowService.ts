import { LoggerService } from '@backstage/backend-plugin-api';

import {
  extractWorkflowFormat,
  FilterInfo,
  fromWorkflowSource,
  getWorkflowCategory,
  ProcessInstance,
  ProcessInstanceStateValues,
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowOverview,
} from '@backstage-community/plugin-orchestrator-common';

import { Pagination } from '../types/pagination';
import { DataIndexService } from './DataIndexService';

export class SonataFlowService {
  constructor(
    private readonly dataIndexService: DataIndexService,
    private readonly logger: LoggerService,
  ) {}

  public async fetchWorkflowInfoOnService(args: {
    definitionId: string;
    serviceUrl: string;
  }): Promise<WorkflowInfo | undefined> {
    try {
      const urlToFetch = `${args.serviceUrl}/management/processes/${args.definitionId}`;
      const response = await fetch(urlToFetch);

      if (response.ok) {
        const json = await response.json();
        this.logger.debug(
          `Fetch workflow info result: ${JSON.stringify(json)}`,
        );
        return json;
      }
      const responseStr = JSON.stringify(response);
      this.logger.error(
        `Response was NOT okay when fetch(${urlToFetch}). Received response: ${responseStr}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching workflow info: ${error}`);
    }

    return undefined;
  }

  public async fetchWorkflowDefinition(
    definitionId: string,
  ): Promise<WorkflowDefinition | undefined> {
    try {
      const source = await this.dataIndexService.fetchWorkflowSource(
        definitionId,
      );
      if (source) {
        return fromWorkflowSource(source);
      }
    } catch (error) {
      this.logger.error(`Error when fetching workflow definition: ${error}`);
    }
    return undefined;
  }

  public async fetchWorkflowOverviews(args: {
    definitionIds?: string[];
    pagination?: Pagination;
    filter?: FilterInfo;
  }): Promise<WorkflowOverview[] | undefined> {
    const { definitionIds, pagination, filter } = args;
    try {
      const workflowInfos = await this.dataIndexService.fetchWorkflowInfos({
        definitionIds,
        pagination,
        filter,
      });
      if (!workflowInfos?.length) {
        return [];
      }
      const items = await Promise.all(
        workflowInfos
          .filter(info => info.source)
          .map(info => this.fetchWorkflowOverviewBySource(info.source!)),
      );
      return items.filter((item): item is WorkflowOverview => !!item);
    } catch (error) {
      this.logger.error(
        `Error when fetching workflows for workflowOverview: ${error}`,
      );
    }
    return undefined;
  }

  public async executeWorkflow(args: {
    definitionId: string;
    serviceUrl: string;
    inputData: ProcessInstanceVariables;
    businessKey?: string;
  }): Promise<WorkflowExecutionResponse | undefined> {
    try {
      const urlToFetch = args.businessKey
        ? `${args.serviceUrl}/${args.definitionId}?businessKey=${args.businessKey}`
        : `${args.serviceUrl}/${args.definitionId}`;

      const result = await fetch(urlToFetch, {
        method: 'POST',
        body: JSON.stringify(args.inputData),
        headers: { 'content-type': 'application/json' },
      });

      const json = await result.json();
      this.logger.debug(`Execute workflow result: ${JSON.stringify(json)}`);
      return json;
    } catch (error) {
      this.logger.error(`Error when executing workflow: ${error}`);
    }
    return undefined;
  }

  public async fetchWorkflowOverview(
    definitionId: string,
  ): Promise<WorkflowOverview | undefined> {
    const source = await this.dataIndexService.fetchWorkflowSource(
      definitionId,
    );
    if (!source) {
      this.logger.debug(`Workflow source not found: ${definitionId}`);
      return undefined;
    }
    return await this.fetchWorkflowOverviewBySource(source);
  }

  private async fetchWorkflowOverviewBySource(
    source: string,
  ): Promise<WorkflowOverview | undefined> {
    let processInstances: ProcessInstance[] = [];
    const limit = 10;
    let offset: number = 0;

    let lastTriggered: Date = new Date(0);
    let lastRunStatus: ProcessInstanceStateValues | undefined;
    let lastRunId: string | undefined;
    let counter = 0;
    let totalDuration = 0;
    const definition = fromWorkflowSource(source);

    do {
      processInstances =
        await this.dataIndexService.fetchInstancesByDefinitionId({
          definitionId: definition.id,
          limit,
          offset,
        });

      for (const pInstance of processInstances) {
        if (!pInstance.start) {
          continue;
        }
        if (new Date(pInstance.start) > lastTriggered) {
          lastRunId = pInstance.id;
          lastTriggered = new Date(pInstance.start);
          lastRunStatus = pInstance.state;
        }
        if (pInstance.end) {
          const start: Date = new Date(pInstance.start);
          const end: Date = new Date(pInstance.end);
          totalDuration += end.valueOf() - start.valueOf();
          counter++;
        }
      }
      offset += limit;
    } while (processInstances.length > 0);

    return {
      workflowId: definition.id,
      name: definition.name,
      format: extractWorkflowFormat(source),
      lastRunId,
      lastTriggeredMs: lastTriggered.getTime(),
      lastRunStatus,
      category: getWorkflowCategory(definition),
      avgDurationMs: counter ? totalDuration / counter : undefined,
      description: definition.description,
    };
  }

  public async pingWorkflowService(args: {
    definitionId: string;
    serviceUrl: string;
  }): Promise<boolean> {
    try {
      const urlToFetch = `${args.serviceUrl}/management/processes/${args.definitionId}`;
      const response = await fetch(urlToFetch);
      return response.ok;
    } catch (error) {
      this.logger.debug(`Error when pinging workflow service: ${error}`);
    }
    return false;
  }

  public async retriggerInstanceInError(args: {
    definitionId: string;
    serviceUrl: string;
    instanceId: string;
  }): Promise<boolean> {
    const { definitionId, serviceUrl, instanceId } = args;
    try {
      const urlToFetch = `${serviceUrl}/management/processes/${definitionId}/instances/${instanceId}/retrigger`;
      const response = await fetch(urlToFetch, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      this.logger.error(`Error when retriggering workflow in error: ${error}`);
    }
    return false;
  }

  public async updateInstanceInputData(args: {
    definitionId: string;
    serviceUrl: string;
    instanceId: string;
    inputData: ProcessInstanceVariables;
  }): Promise<boolean> {
    const { definitionId, serviceUrl, instanceId, inputData } = args;
    try {
      const urlToFetch = `${serviceUrl}/${definitionId}/${instanceId}`;
      const response = await fetch(urlToFetch, {
        method: 'PATCH',
        body: JSON.stringify(inputData),
        headers: { 'content-type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      this.logger.error(`Error when updating instance input data: ${error}`);
    }
    return false;
  }
}
