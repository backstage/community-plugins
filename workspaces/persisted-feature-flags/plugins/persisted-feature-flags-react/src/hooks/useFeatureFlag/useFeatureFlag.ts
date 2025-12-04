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

import { useMemo } from 'react';

import useObservable from 'react-use/esm/useObservable';

import { useApi } from '@backstage/frontend-plugin-api';

import { persistedFeatureFlagsApiRef } from '../../apis';

/**
 * Get the state of a feature flag (persisted if registered, otherwise local).
 *
 * The return value is a boolean indicating whether the flag is enabled.
 *
 * @public
 */
export function useFeatureFlag(flagName: string): boolean {
  const persistedFeatureFlagsApi = useApi(persistedFeatureFlagsApiRef);

  const observable = useMemo(
    () => persistedFeatureFlagsApi.observe$(flagName),
    [persistedFeatureFlagsApi, flagName],
  );

  const snapshot = useObservable(observable);

  const isEnabled = !!snapshot?.value;

  return isEnabled;
}
