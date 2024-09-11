import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  Badge,
  MenuToggle,
  SearchInput,
  Select,
} from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import {
  healthStatusMenuItems,
  syncStatusMenuItems,
  resourcesFiltersMenuItems,
  kindFilterMenuItems,
} from './Filters';
import { handleDelete, handleDeleteGroup } from './filterHelpers';
import { FiltersType, ResourcesFilters } from '../../../../../types/resources';
import { useDarkTheme } from '../../../../../hooks/useDarkTheme';

interface ResourcesFilterByProps {
  filters: FiltersType;
  setFilters: Dispatch<SetStateAction<FiltersType>>;
  allKinds: string[];
}

export const ResourcesFilterBy: FC<ResourcesFilterByProps> = ({
  filters,
  setFilters,
  allKinds,
}) => {
  const [resourcesFilterBy, setResourcesFilterBy] = useState<
    keyof typeof ResourcesFilters | undefined
  >();
  const [isResourcesFilterExpanded, setIsResourcesFilterExpanded] =
    useState<boolean>(false);
  const [isHealthStatusExpanded, setIsHealthStatusExpanded] =
    useState<boolean>(false);
  const [isSyncStatusExpanded, setIsSyncStatusExpanded] =
    useState<boolean>(false);
  const [isKindFilterExpanded, setIsKindFilterExpanded] =
    useState<boolean>(false);

  useDarkTheme();

  const onResourcesFilterToggle = () => {
    setIsResourcesFilterExpanded(!isResourcesFilterExpanded);
  };

  const onResourcesFilterSelect = (
    _event: React.MouseEvent | undefined,
    selection: string | number | undefined,
  ) => {
    const selectedKey = selection as keyof typeof ResourcesFilters;
    setResourcesFilterBy(selectedKey);
    onResourcesFilterToggle();
  };

  const onSelect = (
    filterType: keyof FiltersType,
    _event: React.MouseEvent | undefined,
    selection: string | number | undefined,
  ) => {
    if (typeof selection === 'string') {
      const isSelected = filters[filterType].includes(selection);

      setFilters(prev => ({
        ...prev,
        [filterType]: isSelected
          ? prev[filterType].filter(item => item !== selection)
          : [...prev[filterType], selection],
      }));
    }
  };

  const toggleGroupItems = (
    <>
      <ToolbarItem>
        <Select
          aria-label="ResourcesFilters"
          id="ResourcesFilters"
          toggle={toggleRef => (
            <MenuToggle
              ref={toggleRef}
              onClick={onResourcesFilterToggle}
              isExpanded={isResourcesFilterExpanded}
              style={{ width: '200px' }}
            >
              <FilterIcon />{' '}
              {resourcesFilterBy
                ? ResourcesFilters[resourcesFilterBy]
                : 'Filter by'}
            </MenuToggle>
          )}
          onSelect={onResourcesFilterSelect}
          selected={resourcesFilterBy}
          isOpen={isResourcesFilterExpanded}
        >
          {resourcesFiltersMenuItems()}
        </Select>
      </ToolbarItem>

      <ToolbarItem variant="search-filter">
        <ToolbarFilter
          chips={filters.SearchByName}
          deleteChip={(category, chip) =>
            handleDelete(category, chip, setFilters)
          }
          deleteChipGroup={category => handleDeleteGroup(category, setFilters)}
          categoryName="Name"
        >
          {resourcesFilterBy === 'SearchByName' && (
            <SearchInput
              aria-label="Search by name"
              onChange={(_, value) =>
                setFilters(prev => ({
                  ...prev,
                  SearchByName: value.length ? [value] : [],
                }))
              }
              value={filters.SearchByName[0]}
              onClear={() =>
                setFilters(prev => ({ ...prev, SearchByName: [] }))
              }
              style={{ height: '36px', width: '200px' }}
              placeholder="Search by name"
            />
          )}
        </ToolbarFilter>
      </ToolbarItem>

      <ToolbarGroup variant="filter-group">
        <ToolbarFilter
          chips={filters.HealthStatus}
          deleteChip={(category, chip) =>
            handleDelete(category, chip, setFilters)
          }
          deleteChipGroup={category => handleDeleteGroup(category, setFilters)}
          id="health-status"
          categoryName="Health status"
        >
          {resourcesFilterBy === 'HealthStatus' && (
            <Select
              aria-label="Health Status"
              toggle={toggleRef => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() =>
                    setIsHealthStatusExpanded(!isHealthStatusExpanded)
                  }
                  isExpanded={isHealthStatusExpanded}
                  data-testid="health-status-toggle"
                  style={{ width: '260px' }}
                >
                  Filter by Health status{' '}
                  {filters.HealthStatus.length > 0 && (
                    <Badge isRead>{filters.HealthStatus.length}</Badge>
                  )}
                </MenuToggle>
              )}
              onSelect={(event, selection) =>
                onSelect('HealthStatus', event, selection)
              }
              onOpenChange={isOpen => setIsHealthStatusExpanded(isOpen)}
              isOpen={isHealthStatusExpanded}
            >
              {healthStatusMenuItems(filters)}
            </Select>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={filters.SyncStatus}
          deleteChip={(category, chip) =>
            handleDelete(category, chip, setFilters)
          }
          deleteChipGroup={category => handleDeleteGroup(category, setFilters)}
          categoryName="Sync status"
        >
          {resourcesFilterBy === 'SyncStatus' && (
            <Select
              aria-label="Sync Status"
              toggle={toggleRef => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsSyncStatusExpanded(!isSyncStatusExpanded)}
                  isExpanded={isSyncStatusExpanded}
                  style={{ width: '240px' }}
                >
                  Filter by Sync status{' '}
                  {filters.SyncStatus.length > 0 && (
                    <Badge isRead>{filters.SyncStatus.length}</Badge>
                  )}
                </MenuToggle>
              )}
              onSelect={(event, selection) =>
                onSelect('SyncStatus', event, selection)
              }
              onOpenChange={isOpen => setIsSyncStatusExpanded(isOpen)}
              isOpen={isSyncStatusExpanded}
            >
              {syncStatusMenuItems(filters)}
            </Select>
          )}
        </ToolbarFilter>

        <ToolbarFilter
          chips={filters.Kind}
          deleteChip={(category, chip) =>
            handleDelete(category, chip, setFilters)
          }
          deleteChipGroup={category => handleDeleteGroup(category, setFilters)}
          categoryName="Kind"
        >
          {resourcesFilterBy === 'Kind' && (
            <Select
              aria-label="Kind"
              toggle={toggleRef => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsKindFilterExpanded(!isKindFilterExpanded)}
                  isExpanded={isKindFilterExpanded}
                  style={{ width: '200px' }}
                >
                  Filter by Kind{' '}
                  {filters.Kind.length > 0 && (
                    <Badge isRead>{filters.Kind.length}</Badge>
                  )}
                </MenuToggle>
              )}
              onSelect={(event, selection) =>
                onSelect('Kind', event, selection)
              }
              onOpenChange={isOpen => setIsKindFilterExpanded(isOpen)}
              isOpen={isKindFilterExpanded}
            >
              {kindFilterMenuItems(allKinds, filters)}
            </Select>
          )}
        </ToolbarFilter>
      </ToolbarGroup>
    </>
  );

  return (
    <Toolbar
      id="toolbar-with-filter"
      className="pf-m-toggle-group-container"
      style={{ width: '100%' }}
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={() =>
        setFilters({
          Kind: [],
          HealthStatus: [],
          SyncStatus: [],
          SearchByName: [],
        })
      }
    >
      <ToolbarContent>{toggleGroupItems}</ToolbarContent>
    </Toolbar>
  );
};
