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
import { useState, useCallback } from 'react';
import { CalendarDateValue } from '../components';

export interface UrlFilters {
  riskCategory: string[];
  riskLevel: string[];
  findingCategory: string[];
  riskInsight: string[];
  discoveredOnRange: CalendarDateValue;
  selectedPreset: string;
}

export const useUrlFilters = () => {
  // Get initial values from URL parameters
  const getInitialFilters = (): UrlFilters => {
    if (typeof window === 'undefined') {
      return {
        riskCategory: [],
        riskLevel: [],
        findingCategory: [],
        riskInsight: [],
        discoveredOnRange: [],
        selectedPreset: '',
      };
    }

    const urlParams = new URLSearchParams(window.location.search);

    // Parse array parameters
    const parseArrayParam = (param: string): string[] => {
      const value = urlParams.get(param);
      return value ? value.split(',').filter(Boolean) : [];
    };

    // Parse date range
    const parseDateRange = (): CalendarDateValue => {
      const startDate = urlParams.get('discoveredStart');
      const endDate = urlParams.get('discoveredEnd');

      if (startDate && endDate) {
        try {
          // Parse dates in local timezone to avoid timezone conversion issues
          const parseLocalDate = (dateStr: string) => {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
          };

          return [parseLocalDate(startDate), parseLocalDate(endDate)];
        } catch {
          return [];
        }
      }
      return [];
    };

    return {
      riskCategory: parseArrayParam('riskCategory'),
      riskLevel: parseArrayParam('riskLevel'),
      findingCategory: parseArrayParam('findingCategory'),
      riskInsight: parseArrayParam('riskInsight'),
      discoveredOnRange: parseDateRange(),
      selectedPreset: urlParams.get('preset') || '',
    };
  };

  const [filters, setFilters] = useState<UrlFilters>(getInitialFilters);

  // Update URL parameters
  const updateURL = useCallback((newFilters: Partial<UrlFilters>) => {
    if (typeof window === 'undefined') return;

    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      const url = new URL(window.location.href);

      // Helper to set or delete array parameters
      const setArrayParam = (key: string, values: string[]) => {
        if (values.length > 0) {
          url.searchParams.set(key, values.join(','));
        } else {
          url.searchParams.delete(key);
        }
      };

      // Update URL parameters
      setArrayParam('riskCategory', updatedFilters.riskCategory);
      setArrayParam('riskLevel', updatedFilters.riskLevel);
      setArrayParam('findingCategory', updatedFilters.findingCategory);
      setArrayParam('riskInsight', updatedFilters.riskInsight);

      // Handle date range
      if (
        Array.isArray(updatedFilters.discoveredOnRange) &&
        updatedFilters.discoveredOnRange[0] instanceof Date &&
        updatedFilters.discoveredOnRange[1] instanceof Date
      ) {
        // Format dates in local timezone to avoid timezone conversion issues
        const formatLocalDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        url.searchParams.set(
          'discoveredStart',
          formatLocalDate(updatedFilters.discoveredOnRange[0]),
        );
        url.searchParams.set(
          'discoveredEnd',
          formatLocalDate(updatedFilters.discoveredOnRange[1]),
        );
      } else {
        url.searchParams.delete('discoveredStart');
        url.searchParams.delete('discoveredEnd');
      }

      // Handle preset
      if (updatedFilters.selectedPreset) {
        url.searchParams.set('preset', updatedFilters.selectedPreset);
      } else {
        url.searchParams.delete('preset');
      }

      window.history.replaceState({}, '', url.toString());
      return updatedFilters;
    });
  }, []);

  return {
    filters,
    setRiskCategoryFilter: (value: string[]) =>
      updateURL({ riskCategory: value }),
    setRiskLevelFilter: (value: string[]) => updateURL({ riskLevel: value }),
    setFindingCategoryFilter: (value: string[]) =>
      updateURL({ findingCategory: value }),
    setRiskInsightFilter: (value: string[]) =>
      updateURL({ riskInsight: value }),
    setDiscoveredOnRange: (value: CalendarDateValue) =>
      updateURL({ discoveredOnRange: value }),
    setSelectedPreset: (value: string) => updateURL({ selectedPreset: value }),
  };
};
