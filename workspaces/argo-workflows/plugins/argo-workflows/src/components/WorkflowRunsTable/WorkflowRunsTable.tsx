/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  Header,
  Table,
  useTable,
} from '@backstage/ui';
import { useArgoWorkflows } from '@backstage-community/plugin-argo-workflows-react';
import type {
  ArgoInstanceDetail,
  WorkflowWithSource,
} from '@backstage-community/plugin-argo-workflows-react';
import { buildColumns, workflowSortFn } from '../helpers';
import { filterWorkflows, type WorkflowItem } from '../utils';
import { useElementRect } from '../hooks/useElementRect';
import { useInstanceSelection } from './useInstanceSelection';
import { WorkflowDAGPanel } from './WorkflowDAGPanel';
import { WorkflowRunsToolbar } from './WorkflowRunsToolbar';

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

/**
 * Props for the WorkflowRunsTable component.
 */
export interface WorkflowRunsTableProps {
  /** Kubernetes label selector to filter workflows */
  labelSelector: string;
  /** Optional Argo Workflows instance name */
  instanceName?: string;
  /** Optional Kubernetes namespace to scope the query */
  namespace?: string;
  /** Available instances for the instance selector. When provided, a dropdown is shown. */
  availableInstances?: ArgoInstanceDetail[];
}

/**
 * Adds the stable row id the table needs, falling back to the workflow's
 * namespace/name when the server did not supply a uid.
 */
function toTableItem(workflow: WorkflowWithSource): WorkflowItem {
  const { uid, namespace, name } = workflow.metadata;
  return { ...workflow, id: uid || `${namespace}/${name}` };
}

/**
 * A table of Argo Workflow runs. Selecting a row opens its DAG in a panel at the
 * bottom of the screen; selecting the same row again closes it.
 */
export const WorkflowRunsTable = ({
  labelSelector,
  instanceName,
  namespace,
  availableInstances,
}: WorkflowRunsTableProps) => {
  const instances = useInstanceSelection(availableInstances, instanceName);

  const { workflows, loading, error, retry } = useArgoWorkflows({
    labelSelector,
    instanceNames:
      instances.selected.length > 0 ? instances.selected : undefined,
    instanceName: instances.selected.length === 0 ? instanceName : undefined,
    namespace,
  });

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const contentRef = useRef<HTMLDivElement>(null);
  const contentRect = useElementRect(contentRef);

  // Stamp the refresh time whenever a load finishes successfully.
  useEffect(() => {
    if (!loading && !error) {
      setLastUpdated(new Date());
    }
  }, [loading, error]);

  const columns = useMemo(
    () => buildColumns(expandedRowId, instances.typesByName),
    [expandedRowId, instances.typesByName],
  );

  const handleStatusFiltersChange = useCallback(
    (keys: Set<string | number>) => {
      setStatusFilters(new Set([...keys].map(String)));
    },
    [],
  );

  const rows = useMemo(
    () =>
      filterWorkflows(workflows ?? [], statusFilters, searchQuery).map(
        toTableItem,
      ),
    [workflows, statusFilters, searchQuery],
  );

  const { tableProps } = useTable({
    mode: 'complete',
    data: rows,
    sortFn: workflowSortFn,
    initialSort: { column: 'startDate', direction: 'descending' },
    paginationOptions: {
      pageSize: DEFAULT_PAGE_SIZE,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
    },
  });

  const toggleRow = useCallback((item: WorkflowItem) => {
    setExpandedRowId(current => (current === item.id ? null : item.id));
  }, []);

  const closePanel = useCallback(() => setExpandedRowId(null), []);

  if (error) {
    return (
      <div data-testid="workflow-runs-table-error">
        <Alert
          status="danger"
          icon
          title="Failed to load workflows"
          description={error.message}
          customActions={
            <Button variant="secondary" onPress={retry}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const expandedWorkflow = expandedRowId
    ? rows.find(row => row.id === expandedRowId)
    : undefined;

  return (
    <Container ref={contentRef}>
      <Header
        title="Workflow runs"
        customActions={
          <WorkflowRunsToolbar
            instances={instances}
            availableInstances={availableInstances}
            statusFilters={statusFilters}
            onStatusFiltersChange={handleStatusFiltersChange}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            lastUpdated={lastUpdated}
            isLoading={loading}
          />
        }
      />

      <Table
        columnConfig={columns}
        {...tableProps}
        isPending={loading}
        emptyState={
          <Alert
            status="info"
            icon
            title="No workflow runs found"
            description="No Argo Workflow executions were found for this entity."
          />
        }
        rowConfig={{ onClick: toggleRow }}
      />

      {expandedWorkflow && (
        <WorkflowDAGPanel
          workflow={expandedWorkflow}
          onClose={closePanel}
          bounds={contentRect}
        />
      )}
    </Container>
  );
};
