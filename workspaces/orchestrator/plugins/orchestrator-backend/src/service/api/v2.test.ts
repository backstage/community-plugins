import {
  AssessedProcessInstanceDTO,
  ExecuteWorkflowResponseDTO,
  ProcessInstanceListResultDTO,
  toWorkflowYaml,
  WorkflowDataDTO,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
  WorkflowRunStatusDTO,
} from '@backstage-community/plugin-orchestrator-common';

import { buildPagination } from '../../types/pagination';
import { OrchestratorService } from '../OrchestratorService';
import assessedProcessInstanceData from './mapping/__fixtures__/assessedProcessInstance.json';
import {
  mapToGetWorkflowInstanceResults,
  mapToWorkflowOverviewDTO,
} from './mapping/V2Mappings';
import {
  generateProcessInstance,
  generateProcessInstances,
  generateTestExecuteWorkflowResponse,
  generateTestWorkflowInfo,
  generateTestWorkflowOverview,
  generateTestWorkflowOverviewList,
  generateWorkflowDefinition,
} from './test-utils';
import { V1 } from './v1';
import { V2 } from './v2';

jest.mock('../Helper.ts', () => ({
  retryAsyncFunction: jest.fn(),
}));

jest.mock('../OrchestratorService', () => ({
  OrchestratorService: jest.fn(),
}));

// Helper function to create a mock OrchestratorService instance
const createMockOrchestratorService = (): OrchestratorService => {
  const mockOrchestratorService = new OrchestratorService(
    {} as any, // Mock sonataFlowService
    {} as any, // Mock dataIndexService
    {} as any, // Mock workflowCacheService
  );

  mockOrchestratorService.fetchWorkflowOverviews = jest.fn();
  mockOrchestratorService.fetchWorkflowOverview = jest.fn();
  mockOrchestratorService.fetchWorkflowDefinition = jest.fn();
  mockOrchestratorService.fetchWorkflowSource = jest.fn();
  mockOrchestratorService.fetchWorkflowInfo = jest.fn();
  mockOrchestratorService.fetchInstances = jest.fn();
  mockOrchestratorService.fetchInstance = jest.fn();
  mockOrchestratorService.fetchInstancesTotalCount = jest.fn();
  mockOrchestratorService.executeWorkflow = jest.fn();
  mockOrchestratorService.abortWorkflowInstance = jest.fn();

  return mockOrchestratorService;
};
const mockOrchestratorService = createMockOrchestratorService();
const v2 = new V2(mockOrchestratorService, new V1(mockOrchestratorService));

describe('getWorkflowOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('0 items in workflow overview list', async () => {
    // Arrange
    const mockRequest: any = {
      query: {
        page: 1,
        pageSize: 50,
        orderBy: 'lastUpdated',
        orderDirection: 'DESC',
      },
    };
    const mockOverviewsV1 = {
      items: [],
    };

    (
      mockOrchestratorService.fetchWorkflowOverviews as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);

    // Act
    const result: WorkflowOverviewListResultDTO = await v2.getWorkflowsOverview(
      buildPagination(mockRequest),
    );

    // Assert
    expect(result).toEqual({
      overviews: mockOverviewsV1.items.map(item =>
        mapToWorkflowOverviewDTO(item),
      ),
      paginationInfo: {
        page: 1,
        pageSize: 50,
        totalCount: mockOverviewsV1.items.length,
      },
    });
  });

  it('1 item in workflow overview list', async () => {
    // Arrange
    const mockRequest: any = {
      query: {},
    };
    const mockOverviewsV1 = generateTestWorkflowOverviewList(1, {});

    (
      mockOrchestratorService.fetchWorkflowOverviews as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);

    // Act
    const result: WorkflowOverviewListResultDTO = await v2.getWorkflowsOverview(
      buildPagination(mockRequest),
    );

    // Assert
    expect(result).toEqual({
      overviews: mockOverviewsV1.items.map(item =>
        mapToWorkflowOverviewDTO(item),
      ),
      paginationInfo: {
        page: 0,
        pageSize: 10,
        totalCount: mockOverviewsV1.items.length,
      },
    });
  });

  it('many items in workflow overview list', async () => {
    // Arrange
    const mockRequest: any = {
      query: {
        page: 1,
        pageSize: 50,
        orderBy: 'lastUpdated',
        orderDirection: 'DESC',
      },
    };
    const mockOverviewsV1 = generateTestWorkflowOverviewList(100, {});

    (
      mockOrchestratorService.fetchWorkflowOverviews as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);

    // Act
    const result: WorkflowOverviewListResultDTO = await v2.getWorkflowsOverview(
      buildPagination(mockRequest),
    );

    // Assert
    expect(result).toEqual({
      overviews: mockOverviewsV1.items.map(item =>
        mapToWorkflowOverviewDTO(item),
      ),
      paginationInfo: {
        page: 1,
        pageSize: 50,
        totalCount: mockOverviewsV1.items.length,
      },
    });
  });

  it('undefined workflow overview list', async () => {
    // Arrange
    const mockRequest: any = {
      query: {},
    };
    (
      mockOrchestratorService.fetchWorkflowOverviews as jest.Mock
    ).mockRejectedValue(new Error('no workflow overview'));

    // Act
    const promise = v2.getWorkflowsOverview(buildPagination(mockRequest));

    // Assert
    await expect(promise).rejects.toThrow('no workflow overview');
  });
});
describe('getWorkflowOverviewById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('0 items in workflow overview list', async () => {
    // Arrange
    const mockOverviewsV1 = {
      items: [],
    };
    (
      mockOrchestratorService.fetchWorkflowOverview as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);
    // Act
    const overviewV2 = await v2.getWorkflowOverviewById('test_workflowId');

    // Assert
    expect(overviewV2).toBeDefined();
    expect(overviewV2.workflowId).toBeUndefined();
    expect(overviewV2.name).toBeUndefined();
    expect(overviewV2.format).toBeUndefined();
    expect(overviewV2.lastTriggeredMs).toBeUndefined();
    expect(overviewV2.lastRunStatus).toBeUndefined();
    expect(overviewV2.category).toEqual('infrastructure');
    expect(overviewV2.avgDurationMs).toBeUndefined();
    expect(overviewV2.description).toBeUndefined();
  });

  it('1 item in workflow overview list', async () => {
    // Arrange
    const mockOverviewsV1 = generateTestWorkflowOverview({
      name: 'test_workflowId',
    });

    (
      mockOrchestratorService.fetchWorkflowOverview as jest.Mock
    ).mockResolvedValue(mockOverviewsV1);

    // Act
    const result: WorkflowOverviewDTO =
      await v2.getWorkflowOverviewById('test_workflowId');

    // Assert
    expect(result).toEqual(mapToWorkflowOverviewDTO(mockOverviewsV1));
  });
});

describe('getWorkflowById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Workflow doesn't exists", async () => {
    (
      mockOrchestratorService.fetchWorkflowSource as jest.Mock
    ).mockRejectedValue(new Error('No definition'));
    // Act
    const promise = v2.getWorkflowById('test_workflowId');

    // Assert
    await expect(promise).rejects.toThrow('No definition');
  });

  it('1 items in workflow list', async () => {
    const testFormat = 'yaml';
    const wfDefinition = generateWorkflowDefinition;
    const source = toWorkflowYaml(wfDefinition);

    (
      mockOrchestratorService.fetchWorkflowSource as jest.Mock
    ).mockResolvedValue(source);
    // Act
    const workflowV2 = await v2.getWorkflowById('test_workflowId');

    // Assert
    expect(workflowV2).toBeDefined();
    expect(workflowV2.id).toBeDefined();
    expect(workflowV2.id).toEqual(wfDefinition.id);
    expect(workflowV2.name).toEqual(wfDefinition.name);
    expect(workflowV2.format).toEqual(testFormat);
    expect(workflowV2.description).toEqual(wfDefinition.description);
    expect(workflowV2.category).toEqual('infrastructure');
    expect(workflowV2.annotations).toBeDefined();
  });
});

describe('executeWorkflow', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });
  it('executes a given workflow', async () => {
    // Arrange
    const workflowInfo = generateTestWorkflowInfo();
    const execResponse = generateTestExecuteWorkflowResponse();
    (mockOrchestratorService.fetchWorkflowInfo as jest.Mock).mockResolvedValue(
      workflowInfo,
    );

    (mockOrchestratorService.executeWorkflow as jest.Mock).mockResolvedValue(
      execResponse,
    );
    const workflowData = {
      inputData: {
        customAttrib: 'My customAttrib',
      },
    };
    // Act
    const actualResultV2: ExecuteWorkflowResponseDTO = await v2.executeWorkflow(
      workflowData,
      workflowInfo.id,
      'businessKey',
    );

    // Assert
    expect(actualResultV2).toBeDefined();
    expect(actualResultV2.id).toBeDefined();
    expect(actualResultV2.id).toEqual(execResponse.id);
    expect(actualResultV2).toEqual(execResponse);
  });
});

describe('getInstances', () => {
  const mockRequest: any = {
    query: {},
  };
  const pagination = buildPagination(mockRequest);
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Instance doesn't exist", async () => {
    // Arrange
    (mockOrchestratorService.fetchInstances as jest.Mock).mockRejectedValue(
      new Error('No instance'),
    );
    // Act
    const promise = v2.getInstances(pagination);

    // Assert
    await expect(promise).rejects.toThrow('No instance');
  });

  it('1 item in process instance list', async () => {
    const processInstance = generateProcessInstance(1);

    (mockOrchestratorService.fetchInstances as jest.Mock).mockResolvedValue([
      processInstance,
    ]);

    // Act
    const processInstanceV2: ProcessInstanceListResultDTO =
      await v2.getInstances(pagination);

    // Assert
    expect(processInstanceV2).toBeDefined();
    expect(processInstanceV2.items).toBeDefined();
    expect(processInstanceV2.items).toHaveLength(1);
    expect(processInstanceV2.items?.[0].id).toEqual(processInstance.id);
  });
  it('10 items in process instance list', async () => {
    const howmany = 10;
    const processInstances = generateProcessInstances(howmany);

    (mockOrchestratorService.fetchInstances as jest.Mock).mockResolvedValue(
      processInstances,
    );

    // Act
    const processInstanceList: ProcessInstanceListResultDTO =
      await v2.getInstances(pagination);

    // Assert
    expect(processInstanceList).toBeDefined();
    expect(processInstanceList.items).toBeDefined();
    expect(processInstanceList.items).toHaveLength(howmany);
    for (let i = 0; i < howmany; i++) {
      expect(processInstanceList.items?.[i].id).toEqual(processInstances[i].id);
    }
  });
});

describe('getInstanceById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Instance doesn't exist", async () => {
    (mockOrchestratorService.fetchInstance as jest.Mock).mockRejectedValue(
      new Error('No instance'),
    );
    // Act
    const promise = v2.getInstanceById('testInstanceId');

    // Assert
    await expect(promise).rejects.toThrow('No instance');
  });

  it('Instance exists and do not include assessment', async () => {
    const processInstance = generateProcessInstance(1);

    (mockOrchestratorService.fetchInstance as jest.Mock).mockResolvedValue(
      processInstance,
    );

    // Act
    const processInstanceV2: AssessedProcessInstanceDTO =
      await v2.getInstanceById(processInstance.id);

    // Assert
    expect(mockOrchestratorService.fetchInstance).toHaveBeenCalledTimes(1);
    expect(processInstanceV2).toBeDefined();
    expect(processInstanceV2.instance).toBeDefined();
    expect(processInstanceV2.assessedBy).toBeUndefined();
    expect(processInstanceV2.instance.id).toEqual(processInstance.id);
  });

  it('Instance exists, assessment non empty string', async () => {
    const processInstance = generateProcessInstance(1);
    processInstance.businessKey = 'testBusinessKey';
    const assessedBy = generateProcessInstance(1);
    assessedBy.id = processInstance.businessKey;

    (mockOrchestratorService.fetchInstance as jest.Mock)
      .mockResolvedValueOnce(processInstance)
      .mockResolvedValueOnce(assessedBy);

    // Act
    const processInstanceV2: AssessedProcessInstanceDTO =
      await v2.getInstanceById(processInstance.id, true);

    // Assert
    expect(mockOrchestratorService.fetchInstance).toHaveBeenCalledTimes(2);
    expect(processInstanceV2).toBeDefined();
    expect(processInstanceV2.instance).toBeDefined();
    expect(processInstanceV2.assessedBy).toBeDefined();
    expect(processInstanceV2.assessedBy?.id).toEqual(
      processInstance.businessKey,
    );
    expect(processInstanceV2.instance.id).toEqual(processInstance.id);
  });
});

describe('getWorkflowResults', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('returns process instance', async () => {
    // Arrange
    const mockGetWorkflowResultsV1 = { ...assessedProcessInstanceData };

    (mockOrchestratorService.fetchInstance as jest.Mock).mockResolvedValue(
      mockGetWorkflowResultsV1.instance,
    );

    const expectedResultV2 = mapToGetWorkflowInstanceResults(
      mockGetWorkflowResultsV1.instance.variables,
    );

    // Act
    const actualResultV2: WorkflowDataDTO =
      await v2.getWorkflowResults('testInstanceId');

    // Assert
    expect(actualResultV2).toBeDefined();
    expect(actualResultV2).toEqual(expectedResultV2);
  });

  it('throws error when no variables attribute is present in the instance object', async () => {
    // Arrange
    const mockGetWorkflowResults = { ...assessedProcessInstanceData };

    // @ts-ignore
    delete mockGetWorkflowResults.instance.variables;

    (mockOrchestratorService.fetchInstance as jest.Mock).mockResolvedValue(
      mockGetWorkflowResults,
    );

    // Act
    const promise = v2.getWorkflowResults('instanceId');

    // Assert
    await expect(promise).rejects.toThrow(
      'Error getting workflow instance results with id instanceId',
    );
  });

  it('throws error when no instanceId is provided', async () => {
    const promise = v2.getWorkflowResults('');

    // Assert
    await expect(promise).rejects.toThrow(
      'No instance id was provided to get workflow results',
    );
  });
});

describe('getWorkflowStatuses', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('returns all possible workflow status types', async () => {
    const expectedResultV2 = [
      { key: 'Active', value: 'ACTIVE' },
      { key: 'Error', value: 'ERROR' },
      { key: 'Completed', value: 'COMPLETED' },
      { key: 'Aborted', value: 'ABORTED' },
      { key: 'Suspended', value: 'SUSPENDED' },
      { key: 'Pending', value: 'PENDING' },
    ];

    // Act
    const actualResultV2: WorkflowRunStatusDTO[] =
      await v2.getWorkflowStatuses();

    // Assert
    expect(actualResultV2).toBeDefined();
    expect(actualResultV2).toEqual(expectedResultV2);
  });
});

describe('abortWorkflow', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('aborts workflows', async () => {
    // Arrange
    const workflowId = 'testInstanceId';
    (
      mockOrchestratorService.abortWorkflowInstance as jest.Mock
    ).mockResolvedValue({} as any);

    const expectedResult = `Workflow instance ${workflowId} successfully aborted`;

    // Act
    const actualResult: string = await v2.abortWorkflow(workflowId);

    // Assert
    expect(actualResult).toBeDefined();
    expect(actualResult).toEqual(expectedResult);
  });

  it('throws error when abort workflows response has error attribute', async () => {
    // Arrange
    (
      mockOrchestratorService.abortWorkflowInstance as jest.Mock
    ).mockRejectedValue(new Error('Simulated abort workflow error'));

    // Act
    const promise = v2.abortWorkflow('instanceId');

    // Assert
    await expect(promise).rejects.toThrow('Simulated abort workflow error');
  });
});
