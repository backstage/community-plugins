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
import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { Query } from './queries.type';

export enum FILTER_OPTIONS_QUERY_KEY {
  GET_FILTER_OPTIONS = 'GET_FILTER_OPTIONS',
}

// Filter option types
export type FilterOption = {
  name: string;
  displayName: string;
  sortOrder: number;
  group: string | null;
  groupOrder: number;
  hierarchy: string | null;
};

export type FilterDefinition = {
  name: string;
  displayName: string;
  isGrouped: boolean;
  filterOptions: FilterOption[];
  sortOrder: number;
  filterType: 'dateRange' | 'checkbox';
  isAdditional: boolean;
  defaultValue: string | null;
  defaultValues: string[] | null;
  supportedOperators: string[];
};

export type FilterOptionsSuccessResponseData = FilterDefinition[];

interface FilterOptionsQuery extends Query {}

const getFilterOptionsData = async ({
  fetchApi,
  signal,
  connectApi,
}: FilterOptionsQuery): Promise<FilterOptionsSuccessResponseData> => {
  const url = await connectApi.discoveryApi.getBaseUrl('apiiro');
  return await get<FilterOptionsSuccessResponseData>(
    fetchApi,
    `${url}/filterOptions`,
    {
      signal,
    },
  );
};

export function useFilterOptionsData({
  fetchApi,
  connectApi,
}: Omit<FilterOptionsQuery, 'signal'>) {
  const {
    data: filterOptionsData,
    error: filterOptionsDataError,
    isLoading: filterOptionsDataLoading,
  } = useQuery({
    queryKey: [FILTER_OPTIONS_QUERY_KEY.GET_FILTER_OPTIONS],
    queryFn: ({ signal }) =>
      getFilterOptionsData({
        fetchApi,
        signal,
        connectApi,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes - filter options don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    filterOptionsData,
    filterOptionsDataError,
    filterOptionsDataLoading,
  };
}
