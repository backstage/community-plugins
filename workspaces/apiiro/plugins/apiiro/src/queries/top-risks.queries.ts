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
import { Query, TopRiskSuccessResponseData } from './queries.type';

export enum TOP_RISKS_QUERY_KEY {
  GET_TOP_RISKS = 'GET_TOP_RISKS',
}

const getTopRisksData = async ({
  fetchApi,
  signal,
  connectApi,
  repoId,
  entityRef,
}: Query & { repoId: string; entityRef?: string }) => {
  const url = await connectApi.discoveryApi.getBaseUrl('apiiro');
  const body = { repositoryKey: repoId, ...(entityRef && { entityRef }) };
  return await post<TopRiskSuccessResponseData>(fetchApi, `${url}/top-risks`, {
    signal,
    body,
  });
};

export function useTopRisksData({
  fetchApi,
  connectApi,
  repoId,
  entityRef,
}: Omit<Query, 'signal'> & { repoId?: string; entityRef?: string }) {
  const {
    data: topRisksData,
    error: topRisksDataError,
    isLoading: topRisksDataLoading,
  } = useQuery({
    queryKey: [TOP_RISKS_QUERY_KEY.GET_TOP_RISKS, repoId, entityRef],
    queryFn: ({ signal }) =>
      repoId
        ? getTopRisksData({
            fetchApi,
            signal,
            connectApi,
            repoId,
            entityRef,
          })
        : Promise.resolve([]),
    enabled: !!repoId,
  });

  return {
    topRisksData,
    topRisksDataError,
    topRisksDataLoading,
  };
}
