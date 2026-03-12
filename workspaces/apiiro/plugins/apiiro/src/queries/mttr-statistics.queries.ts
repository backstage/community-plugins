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
import { Query, MttrStatisticsSuccessResponseData } from './queries.type';

export enum MTTR_STATISTICS_QUERY_KEY {
  GET_MTTR_STATISTICS = 'GET_MTTR_STATISTICS',
}

const getMttrStatisticsData = async ({
  fetchApi,
  signal,
  connectApi,
  repositoryKey,
  entityRef,
}: Query & {
  repositoryKey?: string;
  entityRef?: string;
}) => {
  const url = await connectApi.discoveryApi.getBaseUrl('apiiro');
  const body: any = {};

  if (repositoryKey) {
    body.repositoryKey = repositoryKey;
  }

  if (entityRef) {
    body.entityRef = entityRef;
  }

  return await post<MttrStatisticsSuccessResponseData>(
    fetchApi,
    `${url}/mttr-statistics`,
    {
      signal,
      body,
    },
  );
};

export function useMttrStatisticsData({
  fetchApi,
  connectApi,
  repositoryKey,
  entityRef,
}: Omit<Query, 'signal'> & {
  repositoryKey?: string;
  entityRef?: string;
}) {
  const {
    data: mttrStatisticsData,
    error: mttrStatisticsDataError,
    isLoading: mttrStatisticsDataLoading,
  } = useQuery({
    queryKey: [
      MTTR_STATISTICS_QUERY_KEY.GET_MTTR_STATISTICS,
      repositoryKey,
      entityRef,
    ],
    queryFn: ({ signal }) =>
      repositoryKey || entityRef
        ? getMttrStatisticsData({
            fetchApi,
            signal,
            connectApi,
            repositoryKey,
            entityRef,
          })
        : Promise.resolve([]),
    enabled: !!(repositoryKey || entityRef),
  });

  return {
    mttrStatisticsData,
    mttrStatisticsDataError,
    mttrStatisticsDataLoading,
  };
}
