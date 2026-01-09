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
import { Query, SlaBreachSuccessResponseData } from './queries.type';

export enum SLA_BREACH_QUERY_KEY {
  GET_SLA_BREACH = 'GET_SLA_BREACH',
}

const getSlaBreachData = async ({
  fetchApi,
  signal,
  connectApi,
  repositoryKey,
  entityRef,
}: Query & { repositoryKey?: string; entityRef?: string }) => {
  const url = await connectApi.discoveryApi.getBaseUrl('apiiro');
  const body: any = {};

  if (repositoryKey) {
    body.repositoryKey = repositoryKey;
  }

  if (entityRef) {
    body.entityRef = entityRef;
  }

  return await post<SlaBreachSuccessResponseData>(
    fetchApi,
    `${url}/sla-breach`,
    {
      signal,
      body,
    },
  );
};

export function useSlaBreachData({
  fetchApi,
  connectApi,
  repositoryKey,
  entityRef,
}: Omit<Query, 'signal'> & { repositoryKey?: string; entityRef?: string }) {
  const {
    data: slaBreachData,
    error: slaBreachDataError,
    isLoading: slaBreachDataLoading,
  } = useQuery({
    queryKey: [SLA_BREACH_QUERY_KEY.GET_SLA_BREACH, repositoryKey, entityRef],
    queryFn: ({ signal }) =>
      repositoryKey || entityRef
        ? getSlaBreachData({
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
    slaBreachData,
    slaBreachDataError,
    slaBreachDataLoading,
  };
}
