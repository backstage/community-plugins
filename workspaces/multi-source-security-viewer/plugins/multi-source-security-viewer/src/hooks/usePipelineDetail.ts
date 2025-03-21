/*
 * Copyright 2024 The Backstage Authors
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
import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useQuery } from '@tanstack/react-query';
import { PipelineRunResult } from '../models/pipelineRunResult';
import { MssvApi, MssvApiResponse } from '../api/mssv';
import { useLocation } from 'react-router-dom';

export const usePipelineDetail = (
  apiRef: ApiRef<MssvApi>,
  ref: string,
  page: number,
  pageSize: number,
): [PipelineRunResult[] | null, number, boolean, Error | null] => {
  const { entity } = useEntity();
  const api = useApi(apiRef);
  const location = useLocation();
  const errorApi = useApi(errorApiRef);

  const queryFn = async () => {
    try {
      return (
        (await api.getPipelineDetail({ entity, ref, page, pageSize })) || []
      );
    } catch (e) {
      errorApi.post(e);
    }
    return [];
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      `${location.pathname}_${apiRef.id}_pipelineDetail`,
      ref,
      page,
      pageSize,
    ],
    queryFn,
  });

  const { results, totalCount } = (data as MssvApiResponse) ?? {
    results: null,
    totalCount: 0,
  };

  return React.useMemo(() => {
    return [results, totalCount, isLoading, error];
  }, [results, totalCount, isLoading, error]);
};
