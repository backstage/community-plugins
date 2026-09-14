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

import {
  Button,
  Flex,
  SearchField,
  Select,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from '@backstage/ui';
import type { ArgoInstanceDetail } from '@backstage-community/plugin-argo-workflows-react';
import { ALL_STATUSES, formatTimeAgo } from '../utils';
import type { InstanceSelection } from './useInstanceSelection';
import styles from './WorkflowRunsTable.module.css';

export interface WorkflowRunsToolbarProps {
  instances: InstanceSelection;
  availableInstances: ArgoInstanceDetail[] | undefined;
  statusFilters: Set<string>;
  onStatusFiltersChange: (keys: Set<string | number>) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  /** Hidden while a refresh is in flight, so the timestamp is never stale. */
  lastUpdated: Date;
  isLoading: boolean;
}

/**
 * Instance picker, status filters, name search and last-updated indicator for
 * the runs table header.
 */
export function WorkflowRunsToolbar({
  instances,
  availableInstances,
  statusFilters,
  onStatusFiltersChange,
  searchQuery,
  onSearchQueryChange,
  lastUpdated,
  isLoading,
}: WorkflowRunsToolbarProps) {
  // A picker is pointless unless there is more than one instance to choose from.
  const showInstancePicker =
    availableInstances !== undefined && availableInstances.length > 1;

  return (
    <Flex align="center" style={{ gap: 'var(--bui-space-3)' }}>
      {showInstancePicker && (
        <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
          <Select
            selectionMode="multiple"
            aria-label="Select instances"
            options={availableInstances.map(instance => ({
              value: instance.name,
              label: instance.name,
            }))}
            value={instances.selected}
            onChange={instances.select}
            size="small"
          />
          {instances.isFiltered && (
            <Button
              variant="tertiary"
              size="small"
              onPress={instances.selectAll}
            >
              All
            </Button>
          )}
        </Flex>
      )}

      <ToggleButtonGroup
        selectionMode="multiple"
        selectedKeys={statusFilters}
        onSelectionChange={onStatusFiltersChange}
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
        onChange={onSearchQueryChange}
      />

      {!isLoading && (
        <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
          <div className={styles.updatedDot} />
          <Text variant="body-small" className={styles.updatedText}>
            {formatTimeAgo(lastUpdated)}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
