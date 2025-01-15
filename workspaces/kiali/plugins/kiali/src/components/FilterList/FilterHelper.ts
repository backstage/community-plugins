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
import { camelCase } from 'lodash';
import { history, HistoryManager, URLParam } from '../../app/History';
import { config } from '../../config';
import {
  ActiveFilter,
  ActiveFiltersInfo,
  DEFAULT_LABEL_OPERATION,
  FilterType,
  ID_LABEL_OPERATION,
  LabelOperation,
  RunnableFilter,
} from '../../types/Filters';
import { SortField } from '../../types/SortFilters';

export const perPageOptions: number[] = [5, 10, 15];
const defaultDuration = 600;
const defaultRefreshInterval = config.toolbar.defaultRefreshInterval;

export const getFiltersFromURL = (
  filterTypes: FilterType[],
): ActiveFiltersInfo => {
  const urlParams = new URLSearchParams(history.location.search);
  const activeFilters: ActiveFilter[] = [];
  filterTypes.forEach(filter => {
    urlParams.getAll(camelCase(filter.category)).forEach(value => {
      activeFilters.push({
        category: filter.category,
        value: value,
      });
    });
  });

  return {
    filters: activeFilters,
    op:
      (urlParams.get(ID_LABEL_OPERATION) as LabelOperation) ||
      DEFAULT_LABEL_OPERATION,
  };
};

export const setFiltersToURL = (
  filterTypes: FilterType[],
  filters: ActiveFiltersInfo,
): ActiveFiltersInfo => {
  const urlParams = new URLSearchParams(history.location.search);
  filterTypes.forEach(type => {
    urlParams.delete(camelCase(type.category));
  });
  // Remove manually the special Filter opLabel
  urlParams.delete('opLabel');
  const cleanFilters: ActiveFilter[] = [];

  filters.filters.forEach(activeFilter => {
    const filterType = filterTypes.find(
      filter => filter.category === activeFilter.category,
    );
    if (!filterType) {
      return;
    }
    cleanFilters.push(activeFilter);
    urlParams.append(camelCase(filterType.category), activeFilter.value);
  });
  urlParams.append(ID_LABEL_OPERATION, filters.op);
  // Resetting pagination when filters change
  history.push(`${history.location.pathname}?${urlParams.toString()}`);
  return { filters: cleanFilters, op: filters.op || DEFAULT_LABEL_OPERATION };
};

export const filtersMatchURL = (
  filterTypes: FilterType[],
  filters: ActiveFiltersInfo,
): boolean => {
  // This can probably be improved and/or simplified?
  const fromFilters: Map<string, string[]> = new Map<string, string[]>();
  filters.filters.forEach(activeFilter => {
    const existingValue = fromFilters.get(activeFilter.category) || [];
    fromFilters.set(
      activeFilter.category,
      existingValue.concat(activeFilter.value),
    );
  });

  const fromURL: Map<string, string[]> = new Map<string, string[]>();
  const urlParams = new URLSearchParams(history.location.search);
  filterTypes.forEach(filter => {
    const values = urlParams.getAll(camelCase(filter.category));
    if (values.length > 0) {
      const existing = fromURL.get(camelCase(filter.category)) || [];
      fromURL.set(filter.category, existing.concat(values));
    }
  });

  if (fromFilters.size !== fromURL.size) {
    return false;
  }
  let equalFilters = true;
  fromFilters.forEach((filterValues, filterName) => {
    const aux = fromURL.get(filterName) || [];
    equalFilters =
      equalFilters &&
      filterValues.every(value => aux.includes(value)) &&
      filterValues.length === aux.length;
  });

  return equalFilters;
};

export const isCurrentSortAscending = (): boolean => {
  return (HistoryManager.getParam(URLParam.DIRECTION) || 'asc') === 'asc';
};

export const currentDuration = (): number => {
  return HistoryManager.getDuration() || defaultDuration;
};

export const currentRefreshInterval = (): number => {
  const refreshInterval = HistoryManager.getNumericParam(
    URLParam.REFRESH_INTERVAL,
  );
  if (refreshInterval === undefined) {
    return defaultRefreshInterval;
  }
  return refreshInterval;
};

export const currentSortField = <T>(
  sortFields: SortField<T>[],
): SortField<T> => {
  const queriedSortedField =
    HistoryManager.getParam(URLParam.SORT) || sortFields[0].param;
  return (
    sortFields.find(sortField => {
      return sortField.param === queriedSortedField;
    }) || sortFields[0]
  );
};

export const compareNullable = <T>(
  a: T | undefined,
  b: T | undefined,
  safeComp: (a2: T, b2: T) => number,
): number => {
  if (!a) {
    return !b ? 0 : 1;
  }
  if (!b) {
    return -1;
  }
  return safeComp(a, b);
};

const runOneFilter = <T>(
  items: T[],
  filter: RunnableFilter<T>,
  active: ActiveFiltersInfo,
) => {
  const relatedActive = {
    filters: active.filters.filter(af => af.category === filter.category),
    op: active.op,
  };
  if (relatedActive.filters.length) {
    return items.filter(item => filter.run(item, relatedActive));
  }
  return items;
};

export const runFilters = <T>(
  items: T[],
  filters: RunnableFilter<T>[],
  active: ActiveFiltersInfo,
) => {
  return filters.reduce((i, f) => runOneFilter(i, f, active), items);
};
