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
import { post } from '../api';
import { Query } from './queries.type';

export enum RISK_QUERY_KEY {
  GET_RISKS = 'GET_RISKS',
}

interface RisksQuery extends Query {
  repositoryId?: string;
  entityRef?: string;
  applicationId?: string;
  filters?: {
    RiskCategory?: string[];
    RiskLevel?: string[];
    FindingCategory?: string[];
    RiskInsight?: string[];
    DiscoveredOn?: {
      start?: string;
      end?: string;
    };
  };
}

const getRisksData = async ({
  fetchApi,
  signal,
  connectApi,
  repositoryId,
  entityRef,
  applicationId,
  filters,
}: RisksQuery) => {
  const url = await connectApi.discoveryApi.getBaseUrl('apiiro');
  const body: any = { filters };

  if (repositoryId) {
    body.repositoryId = repositoryId;
  }

  if (entityRef) {
    body.entityRef = entityRef;
  }

  if (applicationId) {
    body.applicationId = applicationId;
  }

  return await post<any>(fetchApi, `${url}/risks`, {
    signal,
    body,
  });
};

export function useRisksData({
  fetchApi,
  connectApi,
  repositoryId,
  entityRef,
  applicationId,
  filters,
}: Omit<RisksQuery, 'signal'>) {
  const {
    data: risksData,
    error: risksDataError,
    isLoading: risksDataLoading,
  } = useQuery({
    queryKey: [
      RISK_QUERY_KEY.GET_RISKS,
      repositoryId,
      entityRef,
      applicationId,
      filters,
    ],
    queryFn: ({ signal }) =>
      getRisksData({
        fetchApi,
        signal,
        connectApi,
        repositoryId,
        entityRef,
        applicationId,
        filters,
      }),
    enabled: !!repositoryId || !!applicationId,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: 'always', // Always refetch but don't block with loading if cache exists
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary calls
  });

  return {
    risksData,
    risksDataError,
    risksDataLoading, // Only show loading on initial load, not during background refetch
  };
}
