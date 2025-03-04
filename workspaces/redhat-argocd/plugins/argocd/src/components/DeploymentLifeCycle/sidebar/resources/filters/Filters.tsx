/*
 * Copyright 2024 The Backstage Authors
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
import React from 'react';
import { SelectOption, SelectList } from '@patternfly/react-core';
import { ResourcesFilters, FiltersType } from '../../../../../types/resources';
import {
  HealthStatus,
  SyncStatuses,
} from '@backstage-community/plugin-redhat-argocd-common';

export const resourcesFiltersMenuItems = () => (
  <SelectList data-testid="filter-resources-items">
    {(
      Object.keys(ResourcesFilters) as Array<keyof typeof ResourcesFilters>
    ).map(filterKey => (
      <SelectOption data-testid={filterKey} key={filterKey} value={filterKey}>
        {ResourcesFilters[filterKey]}
      </SelectOption>
    ))}
  </SelectList>
);

export const healthStatusMenuItems = (filters: FiltersType) => (
  <SelectList data-testid="filter-health-items">
    {Object.keys(HealthStatus).map(statusKey => (
      <SelectOption
        hasCheckbox
        key={statusKey}
        value={statusKey}
        isSelected={filters.HealthStatus.includes(statusKey)}
      >
        {statusKey}
      </SelectOption>
    ))}
  </SelectList>
);

export const syncStatusMenuItems = (filters: FiltersType) => (
  <SelectList data-testid="filter-sync-items">
    {Object.keys(SyncStatuses).map(statusKey => (
      <SelectOption
        hasCheckbox
        key={statusKey}
        value={statusKey}
        isSelected={filters.SyncStatus.includes(statusKey)}
      >
        {statusKey}
      </SelectOption>
    ))}
  </SelectList>
);

export const kindFilterMenuItems = (
  allKinds: string[],
  filters: FiltersType,
) => (
  <SelectList data-testid="filter-kind-items">
    {allKinds.map(kind => (
      <SelectOption
        hasCheckbox
        key={kind}
        value={kind}
        isSelected={filters.Kind.includes(kind)}
      >
        {kind}
      </SelectOption>
    ))}
  </SelectList>
);
