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
import { ToolbarLabel, ToolbarLabelGroup } from '@patternfly/react-core';
import { FiltersType, ResourcesFilters } from '../../../../../types/resources';

const getResourcesFilterByValue = (
  value: string,
): keyof FiltersType | undefined => {
  return (
    Object.keys(ResourcesFilters) as Array<keyof typeof ResourcesFilters>
  ).find(key => ResourcesFilters[key] === value) as
    | keyof FiltersType
    | undefined;
};

export const handleDelete = (
  category: string | ToolbarLabelGroup,
  label: string | ToolbarLabel,
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>,
) => {
  setFilters(prevFilters => {
    const updatedFilters = { ...prevFilters };
    const filterKey =
      typeof category === 'string'
        ? getResourcesFilterByValue(category)
        : undefined;

    if (filterKey) {
      updatedFilters[filterKey] = prevFilters[filterKey].filter(
        (fil: string) => fil !== label,
      );
    }

    return updatedFilters;
  });
};

export const handleDeleteGroup = (
  category: string | ToolbarLabelGroup,
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>,
) => {
  setFilters(prevFilters => {
    const updatedFilters = { ...prevFilters };
    const filterKey =
      typeof category === 'string'
        ? getResourcesFilterByValue(category)
        : undefined;

    if (filterKey) {
      updatedFilters[filterKey] = [];
    }

    return updatedFilters;
  });
};
