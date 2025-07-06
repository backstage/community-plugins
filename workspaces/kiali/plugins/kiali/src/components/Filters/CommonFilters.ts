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
import {
  AllFilterTypes,
  DEGRADED,
  FAILURE,
  FILTER_ACTION_APPEND,
  FILTER_ACTION_UPDATE,
  HEALTHY,
  NA,
  NOT_READY,
} from '@backstage-community/plugin-kiali-common/types';
import type {
  ActiveFiltersInfo,
  FilterType,
  FilterValue,
} from '@backstage-community/plugin-kiali-common/types';
import { removeDuplicatesArray } from '../../utils/Common';

export const presenceValues: FilterValue[] = [
  {
    id: 'present',
    title: 'Present',
  },
  {
    id: 'notpresent',
    title: 'Not Present',
  },
];

export const istioSidecarFilter: FilterType = {
  category: 'Istio Sidecar',
  placeholder: 'Filter by Istio Sidecar Validation',
  filterType: AllFilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
};

export const healthFilter: FilterType = {
  category: 'Health',
  placeholder: 'Filter by Health',
  filterType: AllFilterTypes.select,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: HEALTHY.name,
      title: HEALTHY.name,
    },
    {
      id: DEGRADED.name,
      title: DEGRADED.name,
    },
    {
      id: FAILURE.name,
      title: FAILURE.name,
    },
    {
      id: NOT_READY.name,
      title: NOT_READY.name,
    },
    {
      id: 'na',
      title: NA.name,
    },
  ],
};

export const labelFilter: FilterType = {
  category: 'Label',
  placeholder: 'Filter by Label',
  filterType: AllFilterTypes.label,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
};

export const getFilterSelectedValues = (
  filter: FilterType,
  activeFilters: ActiveFiltersInfo,
): string[] => {
  const selected: string[] = activeFilters.filters
    .filter(activeFilter => activeFilter.category === filter.category)
    .map(activeFilter => activeFilter.value);
  return removeDuplicatesArray(selected);
};

export const getPresenceFilterValue = (
  filter: FilterType,
  activeFilters: ActiveFiltersInfo,
): boolean | undefined => {
  const presenceFilters = activeFilters.filters.filter(
    activeFilter => activeFilter.category === filter.category,
  );

  if (presenceFilters.length > 0) {
    return presenceFilters[0].value === 'Present';
  }
  return undefined;
};

export const filterByHealth = (items: any[], filterValues: string[]): any[] => {
  return items.filter(itemWithHealth =>
    filterValues.includes(itemWithHealth.health.getGlobalStatus().name),
  );
};
