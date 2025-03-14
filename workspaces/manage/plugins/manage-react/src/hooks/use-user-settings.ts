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
import { useCallback, useEffect, useMemo } from 'react';

import useObservable from 'react-use/lib/useObservable';

import { storageApiRef, useApi } from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

function useUserStorage() {
  return useApi(storageApiRef).forBucket('manage-page');
}

/**
 * Options for the useUserSettings hook.
 *
 * @public
 */
export interface UseUserSettingsOptions<T extends JsonValue> {
  defaultValue?: T | undefined;

  /**
   * If the value stored is an invalid shape, this function can coerce it
   * to the right type
   */
  coerce?: (value: JsonValue) => T;
}

/**
 * Create/use a settings saved per-user.
 *
 * @param feature - The name of the feature/plugin
 * @param key - The particular settings name
 *
 * @public
 */
export function useUserSettings<T extends JsonValue>(
  feature: string,
  key: string,
  options?: UseUserSettingsOptions<T>,
): [value: T | undefined, setValue: (value: T) => void, isSettled: boolean] {
  const { defaultValue, coerce } = options ?? {};

  const userStorage = useUserStorage();

  const storageKey = useMemo(() => `${feature}:${key}`, [feature, key]);

  const observableStorage = useMemo(
    () => userStorage.observe$<T>(storageKey),
    [userStorage, storageKey],
  );
  const current =
    useObservable(observableStorage) ?? userStorage.snapshot(storageKey);

  const isNotSet = current.presence === 'absent';
  const isSettled = current.presence === 'present';

  const value = current?.value ?? defaultValue;

  const setValue = useCallback(
    (val: T) => {
      userStorage.set(storageKey, val);
    },
    [userStorage, storageKey],
  );

  useEffect(() => {
    if (isNotSet && defaultValue !== undefined) {
      setValue(defaultValue);
    }
  }, [setValue, isNotSet, defaultValue]);

  const coercedValue = useMemo(() => {
    return coerce ? coerce(value ?? null) : value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [coercedValue, setValue, isSettled];
}
