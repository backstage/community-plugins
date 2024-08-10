import { LoggerService } from '@backstage/backend-plugin-api';

import { Client, OperationResult } from '@urql/core';

import {
  FilterInfo,
  NodeInstance,
  ProcessInstance,
  WorkflowInfo,
} from '@backstage-community/plugin-orchestrator-common';

import * as graphqlUtils from '../helpers/queryBuilder';
import { Pagination } from '../types/pagination';
import { DataIndexService } from './DataIndexService';

jest.mock('../helpers/queryBuilder', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../helpers/queryBuilder'),
  };
});

jest.mock('@urql/core', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      query: jest.fn(),
    })),
  };
});

const mockOperationResult = <T>(data: T, error?: any): OperationResult<T> => ({
  data,
  error,
  operation: {} as any,
  extensions: {},
  hasNext: false,
  stale: false,
});

const createQueryArgs = (
  type: 'ProcessDefinitions' | 'ProcessInstances' | 'Jobs',
  queryBody: string,
  whereClause?: string,
  pagination?: Pagination,
) => ({
  type,
  queryBody,
  whereClause,
  pagination,
});

describe('fetchWorkflowInfos', () => {
  let loggerMock: LoggerService;
  let buildFilterConditionSpy: any;
  let buildGraphQlQuerySpy: any;
  let dataIndexService: DataIndexService;
  let mockClient: jest.Mocked<Client>;

  const definitionIds = ['id1', 'id2'];
  const processDefinitions = [{ id: 'def1' }, { id: 'def2' }];
  const queryBody = 'id, name, version, type, endpoint, serviceUrl, source';
  const pagination = { limit: 10, offset: 0, order: 'ASC', sortField: 'name' };
  const filter: FilterInfo = {
    fieldName: 'foo',
    operator: 'equal',
    fieldValue: 'bar',
  };
  const filterClause = 'foo:{ equal: bar}';
  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
    } as any;

    (Client as jest.Mock).mockImplementation(() => mockClient);

    loggerMock = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn(),
    };
    dataIndexService = new DataIndexService('fakeUrl', loggerMock);

    // Set up spies on the graphql utility functions
    buildGraphQlQuerySpy = jest.spyOn(graphqlUtils, 'buildGraphQlQuery');
    buildFilterConditionSpy = jest.spyOn(graphqlUtils, 'buildFilterCondition');

    // Clear mocks before each test
    jest.clearAllMocks();
  });
  it('should fetch workflow infos with no parameters', async () => {
    // Given

    const mockQueryResult = { ProcessDefinitions: processDefinitions };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      '',
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({});

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(undefined);
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });

  it('should fetch workflow infos with definitionIds', async () => {
    // Given
    const whereClause = `id: {in: ${JSON.stringify(definitionIds)}}`;
    const mockQueryResult = { ProcessDefinitions: processDefinitions };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(undefined);
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });

  it('should fetch workflow infos with definitionIds and pagination', async () => {
    // Given
    const mockQueryResult = { ProcessDefinitions: processDefinitions };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      `id: {in: ${JSON.stringify(definitionIds)}}`,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
      pagination,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
      whereClause: `id: {in: ${JSON.stringify(definitionIds)}}`,
      pagination,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(undefined);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });

  it('should fetch workflow infos with only filter', async () => {
    // Given
    const mockQueryResult = { ProcessDefinitions: processDefinitions };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      filterClause,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      filter: filter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody: 'id, name, version, type, endpoint, serviceUrl, source',
      whereClause: 'foo:{ equal: bar}',
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(filter);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });

  it('should fetch workflow infos with definitionIds and filter', async () => {
    // Given
    const whereClause = `and: [{id: {in: ${JSON.stringify(
      definitionIds,
    )}}}, {${filterClause}}]`;
    const mockQueryResult = { ProcessDefinitions: processDefinitions };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
      filter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody: 'id, name, version, type, endpoint, serviceUrl, source',
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(filter);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });

  it('should fetch workflow infos with definitionIds, pagination, and filter', async () => {
    // Given
    const whereClause = `and: [{id: {in: ${JSON.stringify(
      definitionIds,
    )}}}, {${filterClause}}]`;
    const mockQueryResult = { ProcessDefinitions: processDefinitions };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      whereClause,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
      pagination,
      filter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
      whereClause,
      pagination,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(filter);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });
});
describe('fetchInstances', () => {
  let loggerMock: LoggerService;
  let buildFilterConditionSpy: any;
  let buildGraphQlQuerySpy: any;

  let dataIndexService: DataIndexService;
  let mockClient: jest.Mocked<Client>;

  const definitionIds = ['id1', 'id2'];
  const processInstances: ProcessInstance[] = [
    {
      id: 'def1',
      processId: 'processId1',
      endpoint: 'endpoint1',
      nodes: [createNodeObject('A'), createNodeObject('B')],
    },
    {
      id: 'def2',
      processId: 'processId2',
      endpoint: 'endpoint2',
      nodes: [createNodeObject('A'), createNodeObject('C')],
    },
  ];
  const pagination = { limit: 10, offset: 0, order: 'ASC', sortField: 'name' };
  const filter: FilterInfo = {
    fieldName: 'foo',
    operator: 'equal',
    fieldValue: 'bar',
  };
  const filterClause = 'foo:{ equal: bar}';
  const processIdNotNullCondition = 'processId: {isNull: false}';
  const processIdDefinitions = `processId: {in: ${JSON.stringify(
    definitionIds,
  )}`;
  const queryBody =
    'id, processName, processId, businessKey, state, start, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey}';

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
    } as any;

    (Client as jest.Mock).mockImplementation(() => mockClient);
    const wfInfo: WorkflowInfo = {
      id: 'wfinfo1',
      source: 'workflow info source',
    };

    loggerMock = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn(),
    };
    dataIndexService = new DataIndexService('fakeUrl', loggerMock);
    // Create a spy for method1
    jest.spyOn(dataIndexService, 'fetchWorkflowInfo').mockResolvedValue(wfInfo);
    // Set up spies on the graphql utility functions
    buildGraphQlQuerySpy = jest.spyOn(graphqlUtils, 'buildGraphQlQuery');
    buildFilterConditionSpy = jest.spyOn(graphqlUtils, 'buildFilterCondition');

    // Clear mocks before each test
    jest.clearAllMocks();
  });
  it('should fetch instances with no parameters', async () => {
    // Given
    const whereClause = processIdNotNullCondition;
    const mockQueryResult = { ProcessInstances: processInstances };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );

    // When
    const result = await dataIndexService.fetchInstances({});

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(undefined);
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });

  it('should fetch instances with definitionIds', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}]`;

    const mockQueryResult = { ProcessInstances: processInstances };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
      pagination: undefined,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(undefined);
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });

  it('should fetch instances with definitionIds and pagination', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}]`;
    const mockQueryResult = { ProcessInstances: processInstances };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,

      pagination,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(undefined);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });

  it('should fetch instances with only filter', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${filterClause}}]`;
    const mockQueryResult = { ProcessInstances: processInstances };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      filter: filter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(filter);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });

  it('should fetch instances with definitionIds and filter', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}, {${filterClause}}]`;
    const mockQueryResult = { ProcessInstances: processInstances };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,
      filter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(filter);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });

  it('should fetch instances with definitionIds, pagination, and filter', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}, {${filterClause}}]`;
    const mockQueryResult = { ProcessInstances: processInstances };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,
      pagination,
      filter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(filter);
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });
});

function createNodeObject(suffix: string): NodeInstance {
  return {
    id: `node${suffix}`,
    name: `node${suffix}`,
    enter: new Date('2024-08-01T14:30:00').toISOString(),
    type: 'NodeType',
    definitionId: `definitionId${suffix}`,
    nodeId: `nodeId${suffix}`,
  };
}
