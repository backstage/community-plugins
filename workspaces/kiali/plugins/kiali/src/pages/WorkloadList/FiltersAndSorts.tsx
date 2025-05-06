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
  ActiveFiltersInfo,
  AllFilterTypes,
  FILTER_ACTION_APPEND,
  FILTER_ACTION_UPDATE,
  FilterType,
  NamespaceInfo,
  RunnableFilter,
} from '@backstage-community/plugin-kiali-common/types';
import { presenceValues } from '../../components/Filters/CommonFilters';

export const appLabelFilter: FilterType = {
  category: 'App Label',
  placeholder: 'Filter by App Label Validation',
  filterType: AllFilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
};

export const labelFilter: RunnableFilter<NamespaceInfo> = {
  category: 'Namespace Label',
  placeholder: 'Filter by Namespace Label',
  filterType: AllFilterTypes.nsLabel,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
  run: (ns: NamespaceInfo, filters: ActiveFiltersInfo) => {
    return filters.filters.some(f => {
      if (f.value.includes('=')) {
        const [k, v] = f.value.split('=');
        return v
          .split(',')
          .some(
            val =>
              !!ns.labels && k in ns.labels && ns.labels[k].startsWith(val),
          );
      }
      return (
        !!ns.labels &&
        Object.keys(ns.labels).some(label => label.startsWith(f.value))
      );
    });
  },
};

export const versionLabelFilter: FilterType = {
  category: 'Version Label',
  placeholder: 'Filter by Version Label Validation',
  filterType: AllFilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
};
