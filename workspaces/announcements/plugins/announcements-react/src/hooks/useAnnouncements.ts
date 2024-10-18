import { useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '../apis';
import {
  AnnouncementsFilters,
  AnnouncementsList,
} from '@backstage-community/plugin-announcements-common';
import { useAsyncRetry } from 'react-use';

type UseAnnouncementsPropOptions = {
  dependencies?: any[];
};

export const useAnnouncements = (
  props: AnnouncementsFilters,
  options?: UseAnnouncementsPropOptions,
): {
  announcements: AnnouncementsList;
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
} => {
  const api = useApi(announcementsApiRef);

  const {
    value: announcementsList,
    loading,
    error,
    retry,
  } = useAsyncRetry(async () => {
    return await api.announcements(props);
  }, [api, ...(options?.dependencies ?? [])]);

  return {
    announcements: announcementsList ?? { count: 0, results: [] },
    loading,
    error,
    retry,
  };
};
