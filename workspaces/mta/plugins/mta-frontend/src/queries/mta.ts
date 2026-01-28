import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Application,
  Identity,
  mtaApiRef,
  Target,
  TaskDashboard,
} from '../api/api';
import { useApi } from '@backstage/core-plugin-api';

export const TargetsQueryKey = 'targets';

export const useUpdateApplication = (onSuccess?: () => void) => {
  const api = useApi(mtaApiRef);
  const queryClient = useQueryClient();

  const updateApplication = async (application: Application) => {
    return await api.updateApplication(application);
  };

  const mutation = useMutation<any, Error, any>({
    mutationFn: updateApplication,
    onSuccess: () => {
      // Only invalidate specific queries that need refreshing after app update
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      throw new Error('Error updating application');
    },
  });

  return mutation;
};

export const useFetchTargets = () => {
  const api = useApi(mtaApiRef);
  const { isLoading, error, data, isError } = useQuery<Target[]>({
    queryKey: ['targets'],
    queryFn: () => api.getTargets(),
    staleTime: 5 * 60 * 1000, // 5 minutes - targets don't change often
  });

  return {
    targets: data,
    isFetching: isLoading,
    fetchError: error,
    isError: isError,
  };
};

interface AnalyzeApplicationParams {
  selectedApp: number;
  analysisOptions: any;
}
interface UseAnalyzeApplicationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
export const useAnalyzeApplication = (
  options?: UseAnalyzeApplicationOptions,
) => {
  const api = useApi(mtaApiRef);
  const queryClient = useQueryClient();

  const analyzeApplications = async ({
    selectedApp,
    analysisOptions,
  }: AnalyzeApplicationParams) => {
    return await api.analyzeMTAApplications(selectedApp, analysisOptions);
  };

  const mutation = useMutation<
    AnalyzeApplicationParams | URL,
    Error,
    AnalyzeApplicationParams
  >({
    mutationFn: analyzeApplications,
    onSuccess: () => {
      if (options?.onSuccess) {
        options.onSuccess();
        // Only invalidate tasks since a new analysis may create new tasks
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    },
  });

  return mutation;
};
export const useFetchIdentities = () => {
  const api = useApi(mtaApiRef);
  const { isLoading, error, data, isError, refetch } = useQuery<Identity[]>({
    queryKey: ['credentials'],
    queryFn: () => api.getIdentities(),
    staleTime: 5 * 60 * 1000, // 5 minutes - identities don't change often
    select: identityData => {
      if (!identityData || !Array.isArray(identityData)) {
        return [
          { id: 999999, name: 'None', kind: 'source' as const },
          { id: 9999999, name: 'None', kind: 'maven' as const },
        ];
      }
      return [
        { id: 999999, name: 'None', kind: 'source' as const },
        { id: 9999999, name: 'None', kind: 'maven' as const },
        ...identityData,
      ];
    },
  });

  return {
    identities: data,
    isFetching: isLoading,
    fetchError: error,
    isError: isError,
    refetch,
  };
};

export const useFetchAppTasks = (id: number) => {
  const api = useApi(mtaApiRef);
  const { error, data, isError, isFetching, refetch } = useQuery<
    TaskDashboard[]
  >({
    queryKey: ['tasks', id],
    queryFn: () => api.getTasks(),
    select: tasks =>
      tasks
        .filter(task => {
          return task.application.id === id && task.kind === 'analyzer';
        })
        .reverse(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // 30 seconds instead of 10
  });
  return {
    tasks: data || [],
    isFetching,
    fetchError: error,
    isError,
    refetch,
  };
};
