import { LoggerService } from '@backstage/backend-plugin-api';

import { Client, fetchExchange, gql } from '@urql/core';

import {
  fromWorkflowSource,
  getWorkflowCategory,
  parseWorkflowVariables,
  ProcessInstance,
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowInfo,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { ErrorBuilder } from '../helpers/errorBuilder';
import { buildGraphQlQuery } from '../helpers/queryBuilder';
import { Pagination } from '../types/pagination';
import { FETCH_PROCESS_INSTANCES_SORT_FIELD } from './constants';

export class DataIndexService {
  private client: Client;

  public constructor(
    private readonly dataIndexUrl: string,
    private readonly logger: LoggerService,
  ) {
    if (!dataIndexUrl.length) {
      throw ErrorBuilder.GET_NO_DATA_INDEX_URL_ERR();
    }

    this.client = this.getNewGraphQLClient();
  }

  private getNewGraphQLClient(): Client {
    const diURL = `${this.dataIndexUrl}/graphql`;
    return new Client({
      url: diURL,
      exchanges: [fetchExchange],
    });
  }

  public async abortWorkflowInstance(instanceId: string): Promise<void> {
    this.logger.info(`Aborting workflow instance ${instanceId}`);
    const ProcessInstanceAbortMutationDocument = gql`
      mutation ProcessInstanceAbortMutation($id: String) {
        ProcessInstanceAbort(id: $id)
      }
    `;

    const result = await this.client.mutation(
      ProcessInstanceAbortMutationDocument,
      { id: instanceId },
    );

    this.logger.debug(
      `Abort workflow instance result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      throw new Error(
        `Error aborting workflow instance ${instanceId}: ${result.error}`,
      );
    }
    this.logger.debug(`Successfully aborted workflow instance ${instanceId}`);
  }

  public async fetchWorkflowInfo(
    definitionId: string,
  ): Promise<WorkflowInfo | undefined> {
    const graphQlQuery = `{ ProcessDefinitions ( where: {id: {equal: "${definitionId}" } } ) { id, name, version, type, endpoint, serviceUrl, source } }`;

    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Get workflow definition result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(`Error fetching workflow definition ${result.error}`);
      throw result.error;
    }

    const processDefinitions = result.data.ProcessDefinitions as WorkflowInfo[];

    if (processDefinitions.length === 0) {
      this.logger.info(`No workflow definition found for ${definitionId}`);
      return undefined;
    }

    return processDefinitions[0];
  }

  public async fetchWorkflowServiceUrls(): Promise<Record<string, string>> {
    const graphQlQuery = `{ ProcessDefinitions { id, serviceUrl } }`;

    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Get workflow service urls result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(`Error fetching workflow service urls ${result.error}`);
      throw result.error;
    }

    const processDefinitions = result.data.ProcessDefinitions as WorkflowInfo[];
    return processDefinitions
      .filter(definition => definition.serviceUrl)
      .map(definition => ({ [definition.id]: definition.serviceUrl! }))
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  public async fetchWorkflowInfos(args: {
    definitionIds?: string[];
    pagination?: Pagination;
  }): Promise<WorkflowInfo[]> {
    this.logger.info(`fetchWorkflowInfos() called: ${this.dataIndexUrl}`);
    const { definitionIds, pagination } = args;

    const graphQlQuery = buildGraphQlQuery({
      type: 'ProcessDefinitions',
      queryBody: 'id, name, version, type, endpoint, serviceUrl, source',
      whereClause: definitionIds
        ? `id: {in: ${JSON.stringify(definitionIds)}}`
        : undefined,
      pagination,
    });
    this.logger.debug(`GraphQL query: ${graphQlQuery}`);
    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Get workflow definitions result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(
        `Error fetching data index swf results ${result.error}`,
      );
      throw result.error;
    }

    return result.data.ProcessDefinitions;
  }

  public async fetchInstances(args: {
    definitionIds?: string[];
    pagination?: Pagination;
  }): Promise<ProcessInstance[]> {
    const { pagination, definitionIds } = args;
    if (pagination) pagination.sortField ??= FETCH_PROCESS_INSTANCES_SORT_FIELD;

    const processIdNotNullCondition = 'processId: {isNull: false}';
    const definitionIdsCondition = definitionIds
      ? `processId: {in: ${JSON.stringify(definitionIds)}}`
      : undefined;
    const whereClause = definitionIdsCondition
      ? `and: [{${processIdNotNullCondition}}, {${definitionIdsCondition}}]`
      : processIdNotNullCondition;

    const graphQlQuery = buildGraphQlQuery({
      type: 'ProcessInstances',
      queryBody:
        'id, processName, processId, businessKey, state, start, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey}',
      whereClause,
      pagination,
    });
    this.logger.debug(`GraphQL query: ${graphQlQuery}`);

    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Fetch process instances result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(`Error when fetching instances: ${result.error}`);
      throw result.error;
    }

    const processInstancesSrc = result.data
      .ProcessInstances as ProcessInstance[];

    const processInstances = await Promise.all(
      processInstancesSrc.map(async instance => {
        return await this.getWorkflowDefinitionFromInstance(instance);
      }),
    );
    return processInstances;
  }

  public async fetchInstancesTotalCount(
    definitionIds?: string[],
  ): Promise<number> {
    const graphQlQuery = buildGraphQlQuery({
      type: 'ProcessInstances',
      queryBody: 'id',
      whereClause: definitionIds
        ? `processId: {in: ${JSON.stringify(definitionIds)}}`
        : undefined,
    });
    this.logger.debug(`GraphQL query: ${graphQlQuery}`);
    const result = await this.client.query(graphQlQuery, {});

    if (result.error) {
      this.logger.error(
        `Error when fetching instances total count: ${result.error}`,
      );
      throw result.error;
    }

    const idArr = result.data.ProcessInstances as ProcessInstance[];

    return idArr.length;
  }

  private async getWorkflowDefinitionFromInstance(instance: ProcessInstance) {
    const workflowInfo = await this.fetchWorkflowInfo(instance.processId);
    if (!workflowInfo?.source) {
      throw new Error(
        `Workflow defintion is required to fetch instance ${instance.id}`,
      );
    }
    const workflowDefinitionSrc: WorkflowDefinition = fromWorkflowSource(
      workflowInfo.source,
    );
    if (workflowInfo) {
      instance.category = getWorkflowCategory(workflowDefinitionSrc);
      instance.description = workflowInfo.description;
    }
    return instance;
  }

  public async fetchWorkflowSource(
    definitionId: string,
  ): Promise<string | undefined> {
    const graphQlQuery = `{ ProcessDefinitions ( where: {id: {equal: "${definitionId}" } } ) { id, source } }`;

    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Fetch workflow source result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(`Error when fetching workflow source: ${result.error}`);
      return undefined;
    }

    const processDefinitions = result.data.ProcessDefinitions as WorkflowInfo[];

    if (processDefinitions.length === 0) {
      this.logger.info(`No workflow source found for ${definitionId}`);
      return undefined;
    }

    return processDefinitions[0].source;
  }

  public async fetchInstancesByDefinitionId(args: {
    definitionId: string;
    limit: number;
    offset: number;
  }): Promise<ProcessInstance[]> {
    const graphQlQuery = `{ ProcessInstances(where: {processId: {equal: "${args.definitionId}" } }, pagination: {limit: ${args.limit}, offset: ${args.offset}}) { id, processName, state, start, end } }`;

    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Fetch workflow instances result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(
        `Error when fetching workflow instances: ${result.error}`,
      );
      throw result.error;
    }

    return result.data.ProcessInstances;
  }

  public async fetchInstanceVariables(
    instanceId: string,
  ): Promise<ProcessInstanceVariables | undefined> {
    const graphQlQuery = `{ ProcessInstances (where: { id: {equal: "${instanceId}" } } ) { variables } }`;

    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Fetch process instance variables result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(
        `Error when fetching process instance variables: ${result.error}`,
      );
      throw result.error;
    }

    const processInstances = result.data.ProcessInstances as ProcessInstance[];

    if (processInstances.length === 0) {
      return undefined;
    }

    return parseWorkflowVariables(processInstances[0].variables);
  }

  public async fetchDefinitionIdByInstanceId(
    instanceId: string,
  ): Promise<string | undefined> {
    const graphQlQuery = `{ ProcessInstances (where: { id: {equal: "${instanceId}" } } ) { processId } }`;

    const result = await this.client.query(graphQlQuery, {});

    this.logger.debug(
      `Fetch process id from instance result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(
        `Error when fetching process id from instance: ${result.error}`,
      );
      throw result.error;
    }

    const processInstances = result.data.ProcessInstances as ProcessInstance[];

    if (processInstances.length === 0) {
      return undefined;
    }

    return processInstances[0].processId;
  }

  public async fetchInstance(
    instanceId: string,
  ): Promise<ProcessInstance | undefined> {
    const FindProcessInstanceQuery = gql`
      query FindProcessInstanceQuery($instanceId: String!) {
        ProcessInstances(where: { id: { equal: $instanceId } }) {
          id
          processName
          processId
          serviceUrl
          businessKey
          state
          start
          end
          nodes {
            id
            nodeId
            definitionId
            type
            name
            enter
            exit
          }
          variables
          parentProcessInstance {
            id
            processName
            businessKey
          }
          error {
            nodeDefinitionId
            message
          }
        }
      }
    `;

    const result = await this.client.query(FindProcessInstanceQuery, {
      instanceId,
    });

    this.logger.debug(
      `Fetch process instance result: ${JSON.stringify(result)}`,
    );

    if (result.error) {
      this.logger.error(
        `Error when fetching process instances: ${result.error}`,
      );
      throw result.error;
    }

    const processInstances = result.data.ProcessInstances as ProcessInstance[];

    if (processInstances.length === 0) {
      return undefined;
    }

    const instance = processInstances[0];

    const workflowInfo = await this.fetchWorkflowInfo(instance.processId);
    if (!workflowInfo?.source) {
      throw new Error(
        `Workflow defintion is required to fetch instance ${instance.id}`,
      );
    }
    const workflowDefinitionSrc: WorkflowDefinition = fromWorkflowSource(
      workflowInfo.source,
    );
    if (workflowInfo) {
      instance.category = getWorkflowCategory(workflowDefinitionSrc);
      instance.description = workflowDefinitionSrc.description;
    }
    return instance;
  }
}
