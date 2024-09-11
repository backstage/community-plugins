import { ToolbarChip, ToolbarChipGroup } from '@patternfly/react-core';
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
  category: string | ToolbarChipGroup,
  chip: string | ToolbarChip,
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
        (fil: string) => fil !== chip,
      );
    }

    return updatedFilters;
  });
};

export const handleDeleteGroup = (
  category: string | ToolbarChipGroup,
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
