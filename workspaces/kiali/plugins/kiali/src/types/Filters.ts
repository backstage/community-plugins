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
export enum TextInputTypes {
  text = 'text',
  date = 'date',
  datetimeLocal = 'datetime-local',
  email = 'email',
  month = 'month',
  number = 'number',
  password = 'password',
  search = 'search',
  tel = 'tel',
  time = 'time',
  url = 'url',
}

// FilterValue maps a Patternfly property. Modify with care.
export interface FilterValue {
  id: string;
  title: string;
}

export enum NonInputTypes {
  typeAhead = 'typeahead',
  select = 'select',
  label = 'label',
  nsLabel = 'nsLabel',
}

export const AllFilterTypes = {
  ...TextInputTypes,
  ...NonInputTypes,
};

// FilterType maps a Patternfly property. Modify with care.
export interface FilterType {
  category: string; // unique filter category name, should be suitable for display or URL query parameter
  placeholder: string;
  filterType: NonInputTypes | TextInputTypes;
  action: string;
  filterValues: FilterValue[];
  loader?: () => Promise<FilterValue[]>;
}

export interface RunnableFilter<T> extends FilterType {
  run: (item: T, filters: ActiveFiltersInfo) => boolean;
}

export const FILTER_ACTION_APPEND = 'append';
export const FILTER_ACTION_UPDATE = 'update';

export interface ActiveFilter {
  category: string;
  value: string;
}

export type LabelOperation = 'and' | 'or';
export const ID_LABEL_OPERATION = 'opLabel';
export const DEFAULT_LABEL_OPERATION: LabelOperation = 'or';

export interface ActiveFiltersInfo {
  filters: ActiveFilter[];
  op: LabelOperation;
}

export interface ToggleType {
  label: string;
  name: string;
  isChecked: boolean;
}

export type ActiveTogglesInfo = Map<string, boolean>;
