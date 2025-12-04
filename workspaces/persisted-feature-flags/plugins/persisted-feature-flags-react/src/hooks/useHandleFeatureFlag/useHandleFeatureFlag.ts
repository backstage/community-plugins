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

import { useCallback, useMemo } from 'react';

import useObservable from 'react-use/esm/useObservable';

import {
  useApi,
  StorageValueSnapshot,
  errorApiRef,
} from '@backstage/frontend-plugin-api';

import { persistedFeatureFlagsApiRef } from '../../apis';

/**
 * The return type of {@link useHandleFeatureFlag}.
 *
 * This type represents a tuple containing:
 *   1. The current state of a feature flag
 *   2. A setter function to update the flag
 *   3. The presence of the flag value in storage
 *
 * @public
 */
export type HandledFeatureFlagResult = [
  /**
   * Whether the feature flag (persisted or local) is enabled.
   */
  isEnabled: boolean,

  /**
   * Set the value of the feature flag (persisted or local).
   */
  setFlag: (value: boolean) => void,

  /**
   * The presence of the flag value in storage.
   *
   * This value will be `undefined` until the value has been fetched from the
   * server.
   */
  presence: StorageValueSnapshot<boolean>['presence'] | undefined,
];

/**
 * Returns the state of a feature flag (persisted feature flag if registered as
 * such, local otherwise), as well as a setter to update the flag, and its
 * current presence in storage.
 *
 * NOTE; This hook is used to manage (e.g. set) feature flags.
 *       You likely want to use {@link useFeatureFlag} to just read the flag state.
 *
 * The return value is a tuple containing:
 * - A boolean indicating whether the flag is enabled.
 * - A setter function to update the flag value.
 * - The presence of the flag value in storage (or `undefined` until it has been
 *   fetched).
 *
 * @public
 */
export function useHandleFeatureFlag(
  flagName: string,
): HandledFeatureFlagResult {
  const errorApi = useApi(errorApiRef);
  const persistedFeatureFlagsApi = useApi(persistedFeatureFlagsApiRef);

  const observable = useMemo(
    () => persistedFeatureFlagsApi.observe$(flagName),
    [persistedFeatureFlagsApi, flagName],
  );

  const snapshot = useObservable(observable);

  const isEnabled = !!snapshot?.value;

  const setFlag = useCallback(
    (val: boolean) => {
      persistedFeatureFlagsApi.set(flagName, val).catch(err => {
        errorApi.post(err);
      });
    },
    [persistedFeatureFlagsApi, errorApi, flagName],
  );

  return [isEnabled, setFlag, snapshot?.presence];
}
