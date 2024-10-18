import { useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '../apis';
import { Category } from '@backstage-community/plugin-announcements-common';
import { useAsyncRetry } from 'react-use';

export const useCategories = (): {
  categories: Category[];
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
} => {
  const api = useApi(announcementsApiRef);

  const {
    value: categories,
    loading,
    error,
    retry,
  } = useAsyncRetry(async () => {
    return await api.categories();
  });

  return {
    categories: categories ?? [],
    loading,
    error,
    retry,
  };
};
