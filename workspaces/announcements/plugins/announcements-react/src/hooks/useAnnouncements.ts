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
import { useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '../apis';
import {
  AnnouncementsFilters,
  AnnouncementsList,
} from '@backstage-community/plugin-announcements-common';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';

/**
 * Hook to retrieve list of announcements.
 *
 * @returns A list of announcements and loading state
 *
 * @public
 */
export const useAnnouncements = (
  props: AnnouncementsFilters,
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
  } = useAsyncRetry(
    async () => api.announcements(props),
    [
      api,
      props.max,
      props.offset,
      props.category,
      props.page,
      props.active,
      props.sortBy,
      props.order,
      props.current,
      props.sendNotification,
      Array.isArray(props.tags) ? props.tags.join(',') : undefined,
    ],
  );

  return {
    announcements: announcementsList ?? { count: 0, results: [] },
    loading,
    error,
    retry,
  };
};
