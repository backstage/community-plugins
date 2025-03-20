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

import { useApi } from '@backstage/core-plugin-api';

import type { KindStarredType } from '../CurrentKindProvider';
import { createUserSettingsContext } from '../UserSettingsProvider';
import { manageApiRef } from '../../api';
import { joinKinds, kindToOpaqueString } from '../../utils';
import { useOrder } from '../../hooks/use-order';

const userSettingsFeature = '$manage-page-kind';
const userSettingsKey = 'order';

const coerceStringArray = (arr: any): string[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.map(value => (typeof value !== 'string' ? `${value}` : value));
};

const userSettingsContext = createUserSettingsContext(
  userSettingsFeature,
  userSettingsKey,
  {
    defaultValue: [],
    coerce: coerceStringArray,
  },
);

/**
 * This is an internal API and should not be used directly.
 *
 * @public
 */
export const KindOrderProvider = userSettingsContext.Provider;

/**
 * This hook is internal and should not be used directly.
 *
 * @public
 */
export const useSetKindOrder = userSettingsContext.useSetSetting;

const useKindOrderUserSetting = userSettingsContext.useSetting;

/**
 * Re-order kinds to adhere to the configured kind order (case-insensitive),
 * i.e. configured in the API.
 */
function useKindOrderFromApi(
  kinds: (string | KindStarredType)[],
): (string | KindStarredType)[] {
  const manageApi = useApi(manageApiRef);
  const { kindOrder } = manageApi;

  const lcKindOrder = useMemo(
    () => kindOrder.map(kind => kind.toLocaleLowerCase('en-US')),
    [kindOrder],
  );

  return useOrder(kinds, lcKindOrder, {
    keyOf: (kind: string | KindStarredType) =>
      kindToOpaqueString(kind).toLocaleLowerCase('en-US'),
    stringifyKey: key => kindToOpaqueString(key),
    nonFoundCompare: (a, b) => a.key.localeCompare(b.key),
    joiner: joinKinds,
  });
}

/**
 * Re-order kinds to adhere to the user settings kind order (case-insensitive)
 * while falling back to the order as configured in the API.
 *
 * @public
 */
export function useKindOrder<T extends string | KindStarredType>(
  kinds: T[],
): T[] {
  const userSettingsOrder = useKindOrderUserSetting() ?? [];
  const apiOrder = useKindOrderFromApi(kinds);

  const orderBy = userSettingsOrder.length > 0 ? userSettingsOrder : apiOrder;

  return useOrder(kinds, orderBy, {
    keyOf: (kind: string | KindStarredType) =>
      kindToOpaqueString(kind).toLocaleLowerCase('en-US'),
    stringifyKey: key => kindToOpaqueString(key),
  });
}
