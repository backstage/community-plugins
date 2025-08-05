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
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

import { Progress } from '@backstage/core-components';
import { JsonValue } from '@backstage/types';

import { useUserSettings } from '../../hooks/use-user-settings';

/** @public */
export interface CreateUserSettingsContextOptions<T extends JsonValue> {
  defaultValue?: T | undefined;

  /**
   * If the value stored is an invalid shape, this function can coerce it
   * to the right type
   */
  coerce?: (value: JsonValue) => T;
}

interface InternalContext<T extends JsonValue> {
  value: T | undefined;
  isSettled: boolean;
}

/** @public */
export interface UserSettingsContextResult<T extends JsonValue> {
  Provider: (props: PropsWithChildren<{}>) => JSX.Element;
  useSetting: () => T | undefined;
  useSetSetting: () => (value: T) => void;
}

/**
 * Create a Provider and hooks for a user settings, one for getting and one for
 * setting.

 * @public
 */
export function createUserSettingsContext<T extends JsonValue>(
  feature: string,
  settingsKey: string,
  options?: CreateUserSettingsContextOptions<T>,
): UserSettingsContextResult<T> {
  const ctx = createContext<InternalContext<T> | undefined>(undefined);

  const useSetting = (): T | undefined => {
    const value = useContext(ctx);

    if (value === undefined) {
      throw new Error('UserSettingsProvider not found');
    }

    return value.value;
  };

  const useSetSetting = (): ((value: T) => void) => {
    const [_, setSetting] = useUserSettings(feature, settingsKey, options);

    return setSetting;
  };

  const Provider = ({ children }: PropsWithChildren<{}>) => {
    const [settingsValue, _, isSettled] = useUserSettings(
      feature,
      settingsKey,
      options,
    );

    const value = useMemo(
      () => ({
        value: settingsValue,
        isSettled,
      }),
      [settingsValue, isSettled],
    );

    if (!value.isSettled) {
      return <Progress />;
    }

    return <ctx.Provider value={value} children={children} />;
  };

  return {
    Provider,
    useSetting,
    useSetSetting,
  };
}
