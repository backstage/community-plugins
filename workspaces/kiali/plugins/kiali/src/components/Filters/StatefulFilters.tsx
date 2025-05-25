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
  ActiveFilter,
  ActiveFiltersInfo,
  ActiveTogglesInfo,
  FilterType,
  LabelOperation,
  ToggleType,
} from '@backstage-community/plugin-kiali-common/types';
import { default as React } from 'react';
import { history, HistoryManager } from '../../app/History';
import * as FilterHelper from '../FilterList/FilterHelper';

export class FilterSelected {
  static selectedFilters: ActiveFilter[] | undefined = undefined;
  static opSelected: LabelOperation;

  static init = (filterTypes: FilterType[]) => {
    let active = FilterSelected.getSelected();
    if (!FilterSelected.isInitialized()) {
      active = FilterHelper.getFiltersFromURL(filterTypes);
      FilterSelected.setSelected(active);
    } else if (!FilterHelper.filtersMatchURL(filterTypes, active)) {
      active = FilterHelper.setFiltersToURL(filterTypes, active);
      FilterSelected.setSelected(active);
    }
    return active;
  };

  static resetFilters = () => {
    FilterSelected.selectedFilters = undefined;
  };

  static setSelected = (activeFilters: ActiveFiltersInfo) => {
    FilterSelected.selectedFilters = activeFilters.filters;
    FilterSelected.opSelected = activeFilters.op;
  };

  static getSelected = (): ActiveFiltersInfo => {
    return {
      filters: FilterSelected.selectedFilters || [],
      op: FilterSelected.opSelected || 'or',
    };
  };

  static isInitialized = () => {
    return FilterSelected.selectedFilters !== undefined;
  };
}

// Column toggles
export class Toggles {
  static checked: ActiveTogglesInfo = new Map<string, boolean>();
  static numChecked = 0;

  static init = (toggles: ToggleType[]): number => {
    Toggles.checked.clear();
    Toggles.numChecked = 0;

    // Prefer URL settings
    const urlParams = new URLSearchParams(history.location.search);
    toggles.forEach(t => {
      const urlIsChecked = HistoryManager.getBooleanParam(
        `${t.name}Toggle`,
        urlParams,
      );
      const isChecked = urlIsChecked === undefined ? t.isChecked : urlIsChecked;
      Toggles.checked.set(t.name, isChecked);
      if (isChecked) {
        Toggles.numChecked++;
      }
    });
    return Toggles.numChecked;
  };

  static setToggle = (name: string, value: boolean): number => {
    HistoryManager.setParam(`${name}Toggle`, `${value}`);
    Toggles.checked.set(name, value);
    Toggles.numChecked = value ? Toggles.numChecked++ : Toggles.numChecked--;
    return Toggles.numChecked;
  };

  static getToggles = (): ActiveTogglesInfo => {
    return new Map<string, boolean>(Toggles.checked);
  };
}

export interface StatefulFiltersProps {
  childrenFirst?: boolean;
  initialFilters: FilterType[];
  initialToggles?: ToggleType[];
  onFilterChange: (active: ActiveFiltersInfo) => void;
  onToggleChange?: (active: ActiveTogglesInfo) => void;
  ref?: React.RefObject<any>;
}

export interface StatefulFilters {
  filterAdded(labelFilt: FilterType, label: string): unknown;
  removeFilter(category: string, label: string): unknown;
}
