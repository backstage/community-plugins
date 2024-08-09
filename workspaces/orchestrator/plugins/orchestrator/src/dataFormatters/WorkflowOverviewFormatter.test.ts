import { WorkflowOverview } from '@backstage-community/plugin-orchestrator-common';

import WorkflowOverviewFormatter, {
  FormattedWorkflowOverview,
} from './WorkflowOverviewFormatter';

describe('WorkflowOverviewAdapter', () => {
  it('should adapt WorkflowOverview to AdaptedWorkflowOverview', () => {
    // Mock data for testing
    const mockWorkflowOverview: WorkflowOverview = {
      workflowId: '123',
      name: 'Sample Workflow',
      lastTriggeredMs: 1697276096000,
      lastRunStatus: 'COMPLETED',
      category: 'Sample Category',
      avgDurationMs: 150000,
      description: 'Sample description',
      format: 'yaml',
    };

    const adaptedData: FormattedWorkflowOverview =
      WorkflowOverviewFormatter.format(mockWorkflowOverview);

    expect(adaptedData.id).toBe(mockWorkflowOverview.workflowId);
    expect(adaptedData.name).toBe(mockWorkflowOverview.name);
    expect(adaptedData.lastTriggered).toBe(
      new Date(mockWorkflowOverview.lastTriggeredMs!).toLocaleString(),
    );
    expect(adaptedData.lastRunStatus).toBe(mockWorkflowOverview.lastRunStatus);
    expect(adaptedData.category).toBe(mockWorkflowOverview.category);
    expect(adaptedData.avgDuration).toBe('3 minutes');
    expect(adaptedData.description).toBe(mockWorkflowOverview.description);
    expect(adaptedData.format).toBe('yaml'); // Adjust based on your expected value
  });

  it('should have --- for undefined data', () => {
    // Mock data for testing
    const mockWorkflowOverview: WorkflowOverview = {
      workflowId: '123',
      format: 'yaml',
    };
    const adaptedData: FormattedWorkflowOverview =
      WorkflowOverviewFormatter.format(mockWorkflowOverview);

    expect(adaptedData.id).toBe(mockWorkflowOverview.workflowId);
    expect(adaptedData.name).toBe('---');
    expect(adaptedData.lastTriggered).toBe('---');
    expect(adaptedData.lastRunStatus).toBe('---');
    expect(adaptedData.category).toBe('---');
    expect(adaptedData.avgDuration).toBe('---');
    expect(adaptedData.description).toBe('---');
    expect(adaptedData.format).toBe('yaml');
  });
});
