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
    // Don't catch errors here - let AuthenticationError propagate for redirect
    return await api.updateApplication(application);
  };

  const mutation = useMutation<any, Error, any>({
    mutationFn: updateApplication,
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: _error => {
      // Handle errors without throwing, which could cause navigation issues
      // Don't log to console due to ESLint rules
      // Don't throw here to prevent navigation issues
    },
  });

  return mutation;
};

export const useFetchTargets = () => {
  const api = useApi(mtaApiRef);
  const { isLoading, error, data, isError } = useQuery<Target[]>({
    queryKey: ['targets'],
    queryFn: async () => {
      // Don't catch errors here - let AuthenticationError propagate for redirect
      return await api.getTargets();
    },
    // Disable automatic refetching to prevent navigation issues
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on 401 errors
  });

  return {
    targets: data || [], // Ensure we always return an array
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
    // Don't catch errors here - let AuthenticationError propagate for redirect
    return await api.analyzeMTAApplications(selectedApp, analysisOptions);
  };

  const mutation = useMutation<
    AnalyzeApplicationParams | URL | any,
    Error,
    AnalyzeApplicationParams
  >({
    mutationFn: analyzeApplications,
    onSuccess: () => {
      if (options?.onSuccess) {
        options.onSuccess();
        queryClient.invalidateQueries();
      }
    },
    onError: error => {
      // Handle errors without causing navigation issues
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  return mutation;
};
export const useFetchIdentities = () => {
  const api = useApi(mtaApiRef);
  const { isLoading, error, data, isError, refetch } = useQuery<Identity[]>({
    queryKey: ['credentials'],
    queryFn: async () => {
      // Don't catch errors here - let AuthenticationError propagate for redirect
      return await api.getIdentities();
    },
    select: identityData => [
      { id: 999999, name: 'None', kind: 'source' },
      { id: 9999999, name: 'None', kind: 'maven' },
      ...(identityData || []), // Handle case where identityData might be undefined
    ],
    // Disable automatic refetching to prevent navigation issues
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on 401 errors
  });

  return {
    identities: data || [], // Ensure we always return an array
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
    queryKey: ['tasks', id], // Include id in the query key for better caching
    queryFn: async () => {
      // Don't catch errors here - let AuthenticationError propagate for redirect
      return await api.getTasks();
    },
    select: tasks => {
      // Safely handle the case where tasks might be undefined
      if (!tasks || !Array.isArray(tasks)) return [];

      return tasks
        .filter(task => {
          return task?.application?.id === id && task?.kind === 'analyzer';
        })
        .reverse();
    },
    // Restore polling while still allowing AuthenticationError to propagate
    refetchInterval: 10000, // Poll every 10 seconds
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on 401 errors
  });

  return {
    tasks: data || [],
    isFetching: isFetching,
    fetchError: error,
    isError: isError,
    refetch, // Expose refetch function for manual refreshing
  };
};
