/*
 * Copyright 2025 The Backstage Authors
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
import { useMemo, useRef, useState } from 'react';

import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { apiiroApiRef } from '../../api';
import { DataGrid } from '../../components/DataGrid';
import { useUrlFilters } from '../../hooks';
import {
  createDefaultQuickRanges,
  CalendarQuickRange,
  CalendarDateValue,
  DiscoveredOnFilter,
  FilterDropdown,
  RiskInsightFilter,
  RiskInsightOption,
  RiskLevel,
} from '../../components';
import { ErrorSnackbar } from '../../components/common/ErrorSnackbar';
import { useRisksData } from '../../queries';
import {
  useFilterOptionsData,
  FilterDefinition,
} from '../../queries/filterOptions.queries';
import { columnVisibilityModal, risksColumns } from './tableConfig';
import Box from '@mui/material/Box';

// Helper function to format date without timezone conversion
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper functions to transform API data to component format
const transformToDropdownOptions = (filterDef: FilterDefinition) => {
  return filterDef.filterOptions.map(option => ({
    value: option.name,
    label: option.displayName,
  }));
};

const transformToRiskLevelOptions = (filterDef: FilterDefinition) => {
  return filterDef.filterOptions.map(option => ({
    value: option.name,
    label: option.displayName,
    icon: <RiskLevel level={option.name as any} iconSize="large" />,
  }));
};

const transformToRiskInsightOptions = (
  filterDef: FilterDefinition,
): RiskInsightOption[] => {
  return filterDef.filterOptions.map(option => ({
    name: option.name,
    displayName: option.displayName,
    description: option.displayName, // Use displayName as description fallback
    sentiment: 'Neutral' as const,
    sortOrder: option.sortOrder,
    group: option.group || 'General',
    groupOrder: option.groupOrder,
  }));
};

// Constants to prevent recreation on every render
const INITIAL_SORTING = [
  {
    field: 'riskLevel',
    sort: 'desc' as const,
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DATA_GRID_FEATURES = {
  quickSearch: true,
  columnPinning: true,
  columnReordering: true,
  customPagination: true,
  columnMenu: true,
  persistLayout: true,
} as const;

export const Risks = ({
  repoId,
  entityRef,
}: {
  repoId: string | undefined;
  entityRef: string;
}) => {
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);
  const quickRanges = useMemo(() => createDefaultQuickRanges(), []);

  // Use URL filters hook
  const {
    filters,
    setRiskCategoryFilter,
    setRiskLevelFilter,
    setFindingCategoryFilter,
    setRiskInsightFilter,
    setDiscoveredOnRange,
    setSelectedPreset,
  } = useUrlFilters();

  // Extract filter values from the hook
  const riskCategoryFilter = filters.riskCategory;
  const riskLevelFilter = filters.riskLevel;
  const findingCategoryFilter = filters.findingCategory;
  const riskInsightFilter = filters.riskInsight;
  const discoveredOnRange = filters.discoveredOnRange;
  const selectedPreset = filters.selectedPreset;

  const [isPresetSelection, setIsPresetSelection] = useState(false);
  const presetSelectionRef = useRef(false);

  // Fetch filter options from API
  const {
    filterOptionsData,
    filterOptionsDataLoading,
    filterOptionsDataError,
  } = useFilterOptionsData({
    connectApi: connectBackendApi,
    fetchApi: fetch,
  });

  // Transform API data to component format
  const riskCategoryOptions = useMemo(() => {
    const filterDef = filterOptionsData?.find(f => f.name === 'RiskCategory');
    return filterDef ? transformToDropdownOptions(filterDef) : [];
  }, [filterOptionsData]);

  const riskLevelOptions = useMemo(() => {
    const filterDef = filterOptionsData?.find(f => f.name === 'RiskLevel');
    return filterDef ? transformToRiskLevelOptions(filterDef) : [];
  }, [filterOptionsData]);

  const findingCategoryOptions = useMemo(() => {
    const filterDef = filterOptionsData?.find(
      f => f.name === 'FindingCategory',
    );
    return filterDef ? transformToDropdownOptions(filterDef) : [];
  }, [filterOptionsData]);

  const riskInsightOptions = useMemo(() => {
    const filterDef = filterOptionsData?.find(f => f.name === 'RiskInsight');
    return filterDef ? transformToRiskInsightOptions(filterDef) : [];
  }, [filterOptionsData]);

  const { risksData, risksDataLoading, risksDataError } = useRisksData({
    connectApi: connectBackendApi,
    fetchApi: fetch,
    repositoryKey: repoId!,
    entityRef: entityRef,
    filters: {
      ...(riskCategoryFilter.length > 0 && {
        RiskCategory: riskCategoryFilter,
      }),
      ...(riskLevelFilter.length > 0 && { RiskLevel: riskLevelFilter }),
      ...(findingCategoryFilter.length > 0 && {
        FindingCategory: findingCategoryFilter,
      }),
      ...(riskInsightFilter.length > 0 && { RiskInsight: riskInsightFilter }),
      ...(Array.isArray(discoveredOnRange) &&
        discoveredOnRange[0] instanceof Date &&
        discoveredOnRange[1] instanceof Date && {
          DiscoveredOn: {
            start: formatDateForAPI(discoveredOnRange[0]),
            end: formatDateForAPI(discoveredOnRange[1]),
          },
        }),
    },
  });

  // Memoize rows to prevent unnecessary re-renders that cause pagination flickering
  const rows = useMemo(() => risksData?.risks || [], [risksData?.risks]);

  const handlePresetSelect = (range: CalendarQuickRange) => {
    setIsPresetSelection(true);
    presetSelectionRef.current = true;
    setSelectedPreset(range.value);
    const nextValue = range.getRange();
    setDiscoveredOnRange(nextValue ?? []);
  };

  const handleCalendarChange = (value: CalendarDateValue) => {
    if (isPresetSelection || presetSelectionRef.current) {
      setIsPresetSelection(false);
      presetSelectionRef.current = false;
      return;
    }
    setDiscoveredOnRange(value);
    setSelectedPreset('');
  };

  return (
    <>
      <DataGrid<any>
        getRowId={row => row.id}
        loading={risksDataLoading}
        tableKey="risks"
        columns={risksColumns}
        rows={rows}
        dataLabel="risks"
        searchBarPlaceHolder="Search risk name..."
        customFilters={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <FilterDropdown
              label="Risk category"
              options={riskCategoryOptions}
              selectedValues={riskCategoryFilter}
              onChange={setRiskCategoryFilter}
              loading={filterOptionsDataLoading}
            />
            <FilterDropdown
              label="Risk level"
              options={riskLevelOptions}
              selectedValues={riskLevelFilter}
              onChange={setRiskLevelFilter}
              loading={filterOptionsDataLoading}
            />
            <FilterDropdown
              label="Finding category"
              options={findingCategoryOptions}
              selectedValues={findingCategoryFilter}
              onChange={setFindingCategoryFilter}
              loading={filterOptionsDataLoading}
            />
            <RiskInsightFilter
              label="Insights"
              options={riskInsightOptions}
              selectedValues={riskInsightFilter}
              onChange={setRiskInsightFilter}
              loading={filterOptionsDataLoading}
            />
            <DiscoveredOnFilter
              value={discoveredOnRange}
              onChange={handleCalendarChange}
              selectedQuickRange={selectedPreset}
              onQuickRangeSelect={handlePresetSelect}
              quickRanges={quickRanges}
              loading={filterOptionsDataLoading}
            />
          </Box>
        }
        features={DATA_GRID_FEATURES}
        initialState={{
          sorting: {
            sortModel: INITIAL_SORTING,
          },
        }}
        initialPageSize={PAGE_SIZE_OPTIONS[0]}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        columnVisibility={columnVisibilityModal}
      />

      <ErrorSnackbar error={risksDataError} />
      <ErrorSnackbar error={filterOptionsDataError} />
    </>
  );
};
