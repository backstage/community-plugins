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

import { useEffect, useMemo } from 'react';

import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useMultiAsync } from './useMultiAsync';

export function useAsyncListFilter<ConditionOptions, T, R = T>(
  list: readonly T[],
  options: {
    conditionOptions: ConditionOptions;
    getCondition: (
      item: T,
    ) =>
      | boolean
      | Promise<boolean>
      | ((options: ConditionOptions) => boolean | Promise<boolean>);
    map?: (item: T) => R | Promise<R>;
    getErrorMessage?: (item: T, errorMessage: string) => string;
  },
): (T | R)[] {
  const {
    conditionOptions,
    getCondition,
    map = t => t,
    getErrorMessage,
  } = options;

  const errorApi = useApi(errorApiRef);

  // Construct a list with a show property being a boolean or Promise<boolean>
  const conditionedList = useMemo(
    () =>
      list
        .map(item => {
          const condition = getCondition(item);

          const show =
            typeof condition === 'function'
              ? condition(conditionOptions)
              : condition;

          return { show, item };
        })
        .filter(entry => entry.show !== false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list, conditionOptions],
  );

  // Asynchronously resolve all the promises in the show property
  const asyncList = useMultiAsync(
    {
      list: conditionedList,
      fn: async entry => {
        const show = await entry.show;
        const newItem = await map(entry.item);
        return { show, newItem };
      },
      map: (_item, { show, newItem }) => ({ item: newItem, show }),
    },
    [conditionedList],
  );

  // Filter out the ones that have (yet) resolved to true
  const filteredList = useMemo(
    () =>
      asyncList.values
        .filter(entry => entry.show === true)
        .map(({ item }) => item),
    [asyncList.values],
  );

  useEffect(() => {
    if (!asyncList.loading && getErrorMessage) {
      asyncList.errors?.forEach(({ item: { item }, error }) => {
        errorApi.post(new Error(getErrorMessage(item, error.message)));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncList.errors, asyncList.loading, errorApi]);

  return filteredList;
}
