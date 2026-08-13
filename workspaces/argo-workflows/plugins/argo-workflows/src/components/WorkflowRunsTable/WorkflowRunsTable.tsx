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
  ButtonIcon,
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
import { RiAddLine, RiSubtractLine, RiFullscreenLine } from '@remixicon/react';
import { useArgoWorkflows } from '@backstage-community/plugin-argo-workflows-react';
import type { ArgoInstanceDetail } from '@backstage-community/plugin-argo-workflows-react';
import { WorkflowDAGInline } from '../WorkflowDAGInline';
import type { WorkflowDAGInlineHandle } from '../WorkflowDAGInline';
import { buildColumns, workflowSortFn } from '../helpers';
import {
  ALL_STATUSES,
  formatTimeAgo,
  filterWorkflows,
  type WorkflowItem,
} from '../utils';
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

/** Horizontal bounds of the content column, in viewport coordinates. */
interface ContentBounds {
  left: number;
  width: number;
}

/**
 * Tracks the horizontal bounds of an element so a `position: fixed` overlay can
 * be aligned to it.
 *
 * A fixed element is positioned against the viewport, so it cannot inherit the
 * content column's width the way an in-flow element does. Observing the column
 * keeps the overlay aligned across window resizes and Backstage sidebar
 * expand/collapse, both of which change the column's offset and width.
 */
function useContentBounds() {
  const ref = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<ContentBounds | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => {
      const { left, width } = el.getBoundingClientRect();
      setBounds(prev =>
        prev && prev.left === left && prev.width === width
          ? prev
          : { left, width },
      );
    };

    measure();
    window.addEventListener('resize', measure);

    // The sidebar toggling changes the column's width without firing a window
    // resize, so observe the element itself as well.
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    observer?.observe(el);

    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  return { ref, bounds };
}

/**
 * The DAG detail panel, pinned to the bottom of the viewport and overlaying the
 * table. Height is capped by CSS at 45% of the screen.
 */
function WorkflowDAGPanel({
  workflow,
  onClose,
  bounds,
}: {
  workflow: WorkflowItem;
  onClose: () => void;
  bounds: ContentBounds | null;
}) {
  const dagRef = useRef<WorkflowDAGInlineHandle>(null);

  return (
    <div
      className={styles.detailPanel}
      role="region"
      aria-label="Workflow DAG view"
      style={bounds ? { left: bounds.left, width: bounds.width } : undefined}
    >
      <div className={styles.detailPanelHeader}>
        <Text variant="title-x-small">DAG — {workflow.metadata.name}</Text>
        <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
          <ButtonIcon
            variant="secondary"
            icon={<RiAddLine size={16} />}
            onPress={() => dagRef.current?.zoomIn()}
            aria-label="Zoom in"
          />
          <ButtonIcon
            variant="secondary"
            icon={<RiSubtractLine size={16} />}
            onPress={() => dagRef.current?.zoomOut()}
            aria-label="Zoom out"
          />
          <ButtonIcon
            variant="secondary"
            icon={<RiFullscreenLine size={16} />}
            onPress={() => dagRef.current?.fitToView()}
            aria-label="Fit to view"
          />
          <Button
            variant="tertiary"
            size="small"
            onPress={onClose}
            aria-label="Close DAG view"
          >
            Close
          </Button>
        </Flex>
      </div>
      <WorkflowDAGInline ref={dagRef} workflow={workflow} />
    </div>
  );
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

  // Sync selectedInstances when availableInstances loads asynchronously
  useEffect(() => {
    if (
      !instanceName &&
      allInstanceNames.length > 0 &&
      selectedInstances.length === 0
    ) {
      setSelectedInstances(allInstanceNames);
    }
  }, [allInstanceNames, instanceName, selectedInstances.length]);

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
  const { ref: contentRef, bounds: contentBounds } = useContentBounds();
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  // Update lastUpdated whenever workflows data changes (loading completes)
  useEffect(() => {
    if (!loading && !error) {
      setLastUpdated(new Date());
    }
  }, [loading, error]);

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
    return filterWorkflows(workflows ?? [], statusFilters, searchQuery);
  }, [workflows, statusFilters, searchQuery]);

  const data: WorkflowItem[] = filteredWorkflows.map(wf => ({
    ...wf,
    id: wf.metadata.uid || `${wf.metadata.namespace}/${wf.metadata.name}`,
    sourceInstance: wf.sourceInstance,
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
    ? data.find(wf => wf.id === expandedRow)
    : undefined;

  return (
    <Container ref={contentRef}>
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
                    value={effectiveInstances}
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
                  {effectiveInstances.length < availableInstances.length && (
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
              {!loading && (
                <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
                  <div className={styles.updatedDot} />
                  <Text variant="body-small" className={styles.updatedText}>
                    {formatTimeAgo(lastUpdated)}
                  </Text>
                </Flex>
              )}
            </Flex>
          </>
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
        rowConfig={{
          onClick: item => {
            setExpandedRow(prev => (prev === item.id ? null : item.id));
          },
        }}
      />
      {selectedWorkflow && (
        <WorkflowDAGPanel
          workflow={selectedWorkflow}
          onClose={() => setExpandedRow(null)}
          bounds={contentBounds}
        />
      )}
    </Container>
  );
};
