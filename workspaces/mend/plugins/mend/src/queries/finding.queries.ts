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

export type FindingData = {
  findingData?: FindingSuccessResponseData;
  findingDataError: Error | null;
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
