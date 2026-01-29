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
import { Query, RiskScoreOverTimeSuccessResponseData } from './queries.type';

export enum RISK_SCORE_OVER_TIME_QUERY_KEY {
  GET_RISK_SCORE_OVER_TIME = 'GET_RISK_SCORE_OVER_TIME',
}

const getRiskScoreOverTimeData = async ({
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

  return await post<RiskScoreOverTimeSuccessResponseData>(
    fetchApi,
    `${url}/risk-score-over-time`,
    {
      signal,
      body,
    },
  );
};

export function useRiskScoreOverTimeData({
  fetchApi,
  connectApi,
  repositoryKey,
  entityRef,
}: Omit<Query, 'signal'> & { repositoryKey?: string; entityRef?: string }) {
  const {
    data: riskScoreOverTimeData,
    error: riskScoreOverTimeDataError,
    isLoading: riskScoreOverTimeDataLoading,
  } = useQuery({
    queryKey: [
      RISK_SCORE_OVER_TIME_QUERY_KEY.GET_RISK_SCORE_OVER_TIME,
      repositoryKey,
      entityRef,
    ],
    queryFn: ({ signal }) =>
      repositoryKey || entityRef
        ? getRiskScoreOverTimeData({
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
    riskScoreOverTimeData,
    riskScoreOverTimeDataError,
    riskScoreOverTimeDataLoading,
  };
}
