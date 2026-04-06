/*
 * Copyright 2026 The Backstage Authors
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
import {
  ApiError,
  Query,
  ApplicationSuccessResponseData,
} from './queries.type';

type UseApplicationsDataResult = {
  applicationsData: ApplicationSuccessResponseData | undefined;
  applicationsDataError: ApiError | null;
  applicationsDataLoading: boolean;
};

export enum APPLICATION_QUERY_KEY {
  GET_APPLICATIONS = 'GET_APPLICATIONS',
}

const getApplicationsData = async ({
  fetchApi,
  signal,
  connectApi,
  applicationId,
  entityRef,
}: Query & { applicationId?: string; entityRef?: string }) => {
  const url = await connectApi.discoveryApi.getBaseUrl('apiiro');
  const body: any = {};

  if (applicationId) {
    body.applicationId = applicationId;
  }

  if (entityRef) {
    body.entityRef = entityRef;
  }

  const requestBody = Object.keys(body).length > 0 ? body : undefined;

  return await post<ApplicationSuccessResponseData>(
    fetchApi,
    `${url}/applications`,
    {
      signal,
      body: requestBody,
    },
  );
};

export function useApplicationsData({
  fetchApi,
  connectApi,
  enabled = true,
  applicationId,
  entityRef,
}: Omit<Query, 'signal'> & {
  enabled?: boolean;
  applicationId?: string;
  entityRef?: string;
}): UseApplicationsDataResult {
  const {
    data: applicationsData,
    error: queryError,
    isLoading: applicationsDataLoading,
  } = useQuery({
    queryKey: [
      APPLICATION_QUERY_KEY.GET_APPLICATIONS,
      applicationId,
      entityRef,
    ],
    queryFn: ({ signal }) =>
      getApplicationsData({
        fetchApi,
        signal,
        connectApi,
        applicationId,
        entityRef,
      }),
    enabled,
  });

  // Transform the error to match ApiError
  const applicationsDataError = queryError ? (queryError as ApiError) : null;

  return {
    applicationsData,
    applicationsDataError,
    applicationsDataLoading,
  };
}
