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
