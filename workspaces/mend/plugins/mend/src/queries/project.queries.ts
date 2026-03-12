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
import { Project } from '../models';
import { get } from '../api';
import { Query } from './queries.types';

export enum PROJECT_QUERY_KEY {
  GET_PROJECT = 'GET_PROJECT',
}

type ProjectSuccessResponseData = {
  clientName: string;
  clientUrl: string;
  projectList: Project[];
};

export type ProjectData = {
  projectData?: ProjectSuccessResponseData;
  projectDataError: Error | null;
  projectDataLoading: boolean;
};

const getProjectData = async ({ signal, fetchApi, connectApi }: Query) => {
  const url = await connectApi.discoveryApi.getBaseUrl('mend');
  return await get<ProjectSuccessResponseData>(fetchApi, `${url}/project`, {
    signal,
  });
};

export function useProjectData({
  fetchApi,
  connectApi,
}: Omit<Query, 'signal'>) {
  const {
    data: projectData,
    error: projectDataError,
    isLoading: projectDataLoading,
  } = useQuery({
    queryKey: [PROJECT_QUERY_KEY.GET_PROJECT],
    queryFn: ({ signal }) => getProjectData({ fetchApi, signal, connectApi }),
  });

  return {
    projectData,
    projectDataError,
    projectDataLoading,
  };
}
