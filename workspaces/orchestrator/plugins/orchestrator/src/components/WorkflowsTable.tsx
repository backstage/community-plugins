import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Link, TableColumn, TableProps } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import Pageview from '@mui/icons-material/Pageview';
import PlayArrow from '@mui/icons-material/PlayArrow';

import {
  capitalize,
  orchestratorWorkflowExecutePermission,
  ProcessInstanceStateValues,
  WorkflowOverview,
} from '@backstage-community/plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import WorkflowOverviewFormatter, {
  FormattedWorkflowOverview,
} from '../dataFormatters/WorkflowOverviewFormatter';
import {
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../routes';
import OverrideBackstageTable from './ui/OverrideBackstageTable';
import { WorkflowInstanceStatusIndicator } from './WorkflowInstanceStatusIndicator';

export interface WorkflowsTableProps {
  items: WorkflowOverview[];
}

export const WorkflowsTable = ({ items }: WorkflowsTableProps) => {
  const navigate = useNavigate();
  const definitionLink = useRouteRef(workflowDefinitionsRouteRef);
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const [data, setData] = useState<FormattedWorkflowOverview[]>([]);
  const permittedToExecute = usePermission({
    permission: orchestratorWorkflowExecutePermission,
  });

  const initialState = useMemo(
    () => items.map(WorkflowOverviewFormatter.format),
    [items],
  );

  useEffect(() => {
    setData(initialState);
  }, [initialState]);

  const handleView = useCallback(
    (rowData: FormattedWorkflowOverview) => {
      navigate(
        definitionLink({ workflowId: rowData.id, format: rowData.format }),
      );
    },
    [definitionLink, navigate],
  );

  const handleExecute = useCallback(
    (rowData: FormattedWorkflowOverview) => {
      navigate(executeWorkflowLink({ workflowId: rowData.id }));
    },
    [executeWorkflowLink, navigate],
  );

  const actions = useMemo(() => {
    const actionItems: TableProps<FormattedWorkflowOverview>['actions'] = [
      {
        icon: () => <PlayArrow />,
        tooltip: 'Execute',
        disabled: !permittedToExecute.allowed,
        onClick: (_, rowData) =>
          handleExecute(rowData as FormattedWorkflowOverview),
      },
      {
        icon: () => <Pageview />,
        tooltip: 'View',
        onClick: (_, rowData) =>
          handleView(rowData as FormattedWorkflowOverview),
      },
    ];

    return actionItems;
  }, [handleExecute, handleView, permittedToExecute]);

  const columns = useMemo<TableColumn<FormattedWorkflowOverview>[]>(
    () => [
      {
        title: 'Name',
        field: 'name',
        render: rowData => (
          <Link
            to={definitionLink({
              workflowId: rowData.id,
              format: rowData.format,
            })}
          >
            {rowData.name}
          </Link>
        ),
      },
      {
        title: 'Category',
        field: 'category',
        render: rowData => capitalize(rowData.category),
      },
      { title: 'Last run', field: 'lastTriggered' },
      {
        title: 'Last run status',
        field: 'lastRunStatus',
        render: rowData =>
          rowData.lastRunStatus !== VALUE_UNAVAILABLE &&
          rowData.lastRunId !== VALUE_UNAVAILABLE ? (
            <WorkflowInstanceStatusIndicator
              status={rowData.lastRunStatus as ProcessInstanceStateValues}
              lastRunId={rowData.lastRunId}
            />
          ) : (
            VALUE_UNAVAILABLE
          ),
      },
      { title: 'Avg. duration', field: 'avgDuration' },
      { title: 'Description', field: 'description' },
    ],
    [definitionLink],
  );

  const options = useMemo<TableProps['options']>(
    () => ({
      search: true,
      paging: false,
      actionsColumnIndex: columns.length,
    }),
    [columns.length],
  );

  return (
    <OverrideBackstageTable<FormattedWorkflowOverview>
      title="Workflows"
      options={options}
      columns={columns}
      data={data}
      actions={actions}
    />
  );
};
