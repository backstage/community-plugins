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
import { ApiError, Query, RepositorySuccessResponseData } from './queries.type';

type UseRepositoriesDataResult = {
  repositoriesData: RepositorySuccessResponseData | undefined;
  repositoriesDataError: ApiError | null;
  repositoriesDataLoading: boolean;
};

export enum REPOSITORY_QUERY_KEY {
  GET_REPOSITORIES = 'GET_REPOSITORIES',
}

const getRepositoriesData = async ({
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

  const requestBody = Object.keys(body).length > 0 ? body : undefined;

  return await post<RepositorySuccessResponseData>(
    fetchApi,
    `${url}/repositories`,
    {
      signal,
      body: requestBody,
    },
  );
};

export function useRepositoriesData({
  fetchApi,
  connectApi,
  enabled = true,
  repositoryKey,
  entityRef,
}: Omit<Query, 'signal'> & {
  enabled?: boolean;
  repositoryKey?: string;
  entityRef?: string;
}): UseRepositoriesDataResult {
  const {
    data: repositoriesData,
    error: queryError,
    isLoading: repositoriesDataLoading,
  } = useQuery({
    queryKey: [REPOSITORY_QUERY_KEY.GET_REPOSITORIES, repositoryKey, entityRef],
    queryFn: ({ signal }) =>
      getRepositoriesData({
        fetchApi,
        signal,
        connectApi,
        repositoryKey,
        entityRef,
      }),
    enabled,
  });

  // Transform the error to match ApiError
  const repositoriesDataError = queryError ? (queryError as ApiError) : null;

  return {
    repositoriesData,
    repositoriesDataError,
    repositoriesDataLoading,
  };
}
