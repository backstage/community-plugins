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
  repositoryId,
  entityRef,
  applicationId,
}: Query & {
  repositoryId?: string;
  entityRef?: string;
  applicationId?: string;
}) => {
  const url = await connectApi.discoveryApi.getBaseUrl('apiiro');
  const body: any = {};

  if (repositoryId) {
    body.repositoryId = repositoryId;
  }

  if (entityRef) {
    body.entityRef = entityRef;
  }

  if (applicationId) {
    body.applicationId = applicationId;
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
  repositoryId,
  entityRef,
  applicationId,
}: Omit<Query, 'signal'> & {
  repositoryId?: string;
  entityRef?: string;
  applicationId?: string;
}) {
  const {
    data: mttrStatisticsData,
    error: mttrStatisticsDataError,
    isLoading: mttrStatisticsDataLoading,
  } = useQuery({
    queryKey: [
      MTTR_STATISTICS_QUERY_KEY.GET_MTTR_STATISTICS,
      repositoryId,
      entityRef,
      applicationId,
    ],
    queryFn: ({ signal }) =>
      repositoryId || applicationId
        ? getMttrStatisticsData({
            fetchApi,
            signal,
            connectApi,
            repositoryId,
            entityRef,
            applicationId,
          })
        : Promise.resolve([]),
    enabled: !!repositoryId || !!applicationId,
  });

  return {
    mttrStatisticsData,
    mttrStatisticsDataError,
    mttrStatisticsDataLoading,
  };
}
