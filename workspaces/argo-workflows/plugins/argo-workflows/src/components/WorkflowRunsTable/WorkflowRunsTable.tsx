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

import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  Flex,
  Header,
  SearchField,
  Select,
  Table,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  useTable,
} from '@backstage/ui';
import { useArgoWorkflows } from '@backstage-community/plugin-argo-workflows-react';
import type { ArgoInstanceDetail } from '@backstage-community/plugin-argo-workflows-react';
import { WorkflowDAGInline } from '../WorkflowDAGInline';
import { buildColumns, workflowSortFn } from '../helpers';
import { ALL_STATUSES, formatTimeAgo, type WorkflowItem } from '../utils';
import styles from './WorkflowRunsTable.module.css';

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
 * Displays a table of Argo Workflow runs with expandable DAG views.
 * Clicking a row reveals the DAG visualization inline below the table.
 */
export const WorkflowRunsTable = ({
  labelSelector,
  instanceName,
  namespace,
  availableInstances,
}: WorkflowRunsTableProps) => {
  const allInstanceNames = useMemo(
    () => (availableInstances ?? []).map(i => i.name),
    [availableInstances],
  );
  const [selectedInstances, setSelectedInstances] = useState<string[]>(
    instanceName ? [instanceName] : allInstanceNames,
  );

  const effectiveInstances =
    selectedInstances.length > 0 ? selectedInstances : allInstanceNames;

  const { workflows, loading, error, retry } = useArgoWorkflows({
    labelSelector,
    instanceNames:
      effectiveInstances.length > 0 ? effectiveInstances : undefined,
    instanceName: effectiveInstances.length === 0 ? instanceName : undefined,
    namespace,
  });

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated] = useState(() => new Date());

  const instanceTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const inst of availableInstances ?? []) {
      map.set(inst.name, inst.type);
    }
    return map;
  }, [availableInstances]);

  const columns = useMemo(
    () => buildColumns(expandedRow, instanceTypeMap),
    [expandedRow, instanceTypeMap],
  );

  const handleSelectionChange = useCallback((keys: Set<string | number>) => {
    setStatusFilters(new Set([...keys].map(String)));
  }, []);

  const filteredWorkflows = useMemo(() => {
    let items = workflows ?? [];
    if (statusFilters.size > 0) {
      items = items.filter(wf => statusFilters.has(wf.status.phase));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      items = items.filter(wf =>
        wf.metadata.name.toLowerCase().includes(query),
      );
    }
    return items;
  }, [workflows, statusFilters, searchQuery]);

  const data: WorkflowItem[] = filteredWorkflows.map(wf => ({
    ...wf,
    id: wf.metadata.name,
    sourceInstance: (wf as any)._sourceInstance,
  }));

  const { tableProps } = useTable({
    mode: 'complete',
    data,
    sortFn: workflowSortFn,
    initialSort: { column: 'startDate', direction: 'descending' },
    paginationOptions: {
      pageSize: 5,
      pageSizeOptions: [5, 10, 25, 50],
    },
  });

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

  const selectedWorkflow = expandedRow
    ? data.find(wf => wf.metadata.name === expandedRow)
    : undefined;

  return (
    <Container>
      <Header
        title="Workflow runs"
        customActions={
          <>
            <Flex align="center" style={{ gap: 'var(--bui-space-3)' }}>
              {availableInstances && availableInstances.length > 1 && (
                <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
                  <Select
                    selectionMode="multiple"
                    aria-label="Select instances"
                    options={availableInstances.map(inst => ({
                      value: inst.name,
                      label: inst.name,
                    }))}
                    value={selectedInstances}
                    onChange={keys => {
                      const values = Array.isArray(keys) ? keys : [keys];
                      setSelectedInstances(
                        values.filter(
                          (v): v is string => typeof v === 'string',
                        ),
                      );
                    }}
                    size="small"
                  />
                  {selectedInstances.length < availableInstances.length && (
                    <Button
                      variant="tertiary"
                      size="small"
                      onPress={() => setSelectedInstances(allInstanceNames)}
                    >
                      All
                    </Button>
                  )}
                </Flex>
              )}
              <ToggleButtonGroup
                selectionMode="multiple"
                selectedKeys={statusFilters}
                onSelectionChange={handleSelectionChange}
                aria-label="Filter by status"
              >
                {ALL_STATUSES.map(status => (
                  <ToggleButton key={status} id={status}>
                    {status}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <SearchField
                placeholder="Search by name…"
                aria-label="Search workflows by name"
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
                <div className={styles.updatedDot} />
                <Text variant="body-small" className={styles.updatedText}>
                  {formatTimeAgo(lastUpdated)}
                </Text>
              </Flex>
            </Flex>
          </>
        }
      />
      <Table
        columnConfig={columns}
        {...tableProps}
        loading={loading}
        emptyState={
          <Alert
            status="info"
            icon
            title="No workflow runs found"
            description="No Argo Workflow executions were found for this entity."
          />
        }
        rowConfig={{
          onClick: item => {
            setExpandedRow(prev =>
              prev === item.metadata.name ? null : item.metadata.name,
            );
          },
        }}
      />
      {selectedWorkflow && (
        <div className={styles.detailPanel}>
          <Text variant="title-x-small" className={styles.detailTitle}>
            DAG — {selectedWorkflow.metadata.name}
          </Text>
          <WorkflowDAGInline workflow={selectedWorkflow} />
        </div>
      )}
    </Container>
  );
};
