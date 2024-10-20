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
