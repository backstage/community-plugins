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
import { Finding, Project } from '../models';
import { post } from '../api';
import { Query } from './queries.types';

export enum FINDING_QUERY_KEY {
  GET_FINDINGS = 'GET_FINDINGS',
}

type FindingRequestData = {
  uid?: string;
} & Query;

type FindingSuccessResponseData = {
  clientName: string;
  clientUrl: string;
  findingList: Finding[];
  projectList: Project[];
  projectSourceUrl: string;
};

type FindingError = Error & {
  response?: any;
  status?: number;
};

export type FindingData = {
  findingData?: FindingSuccessResponseData;
  findingDataError: FindingError | null;
  findingDataLoading: boolean;
};

const getFindingData = async ({
  signal,
  fetchApi,
  uid,
  connectApi,
}: FindingRequestData) => {
  const url = await connectApi.discoveryApi.getBaseUrl('mend');
  return await post<FindingSuccessResponseData>(fetchApi, `${url}/finding`, {
    body: {
      uid: uid,
    },
    signal,
  });
};

export function useFindingData({
  fetchApi,
  uid,
  connectApi,
}: Omit<FindingRequestData, 'signal'>) {
  const {
    data: findingData,
    error: findingDataError,
    isLoading: findingDataLoading,
  } = useQuery({
    queryKey: [FINDING_QUERY_KEY.GET_FINDINGS, uid],
    queryFn: ({ signal }) =>
      getFindingData({ fetchApi, signal, uid, connectApi }),
    enabled: !!uid,
  });

  return {
    findingData,
    findingDataError,
    findingDataLoading,
  };
}
