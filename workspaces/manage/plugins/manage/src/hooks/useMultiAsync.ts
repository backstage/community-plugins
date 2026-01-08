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

import { useEffect, useState } from 'react';

export type UseMultiAsyncOptions<T, V, R> = {
  list: readonly T[];
  fn: (t: T) => PromiseLike<V> | V;
  map: (t: T, v: V) => R;
};

export type UseMultiAsyncWrappedError<T> = {
  item: T;
  error: Error;
};

export type UseMultiAsyncResult<T, R> = {
  values: R[];
  loading: boolean;
  errors: UseMultiAsyncWrappedError<T>[];
};

/**
 * Similar to useAsync, but for multiple items.
 *
 * The hook takes a <list> of values and calls a function <fn> to get a promise
 * (or synchronous value) for each item. For each resolved value, maps the
 * results using <map>.
 *
 * Returns the list of results (<values>) where the items are either the mapped
 * values, or the original values. For asynchronous items, the original value is
 * returned until the promise resolves, at which point the mapped value is used.
 * Also returns a list of <errors> (one for each failed item),
 * and a flag <loading> which is set to false once all <values> are resolved.
 */
export function useMultiAsync<T, V, R>(
  { list, fn, map }: UseMultiAsyncOptions<T, V, R>,
  deps: any[] = [],
): UseMultiAsyncResult<T, R | T> {
  const [errors, setErrors] = useState<UseMultiAsyncWrappedError<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<(R | T)[]>([]);

  useEffect(() => {
    const state = { active: true, waitingFor: 0 };

    setErrors([]);

    const curValues: (T | R)[] = [];

    for (const item of list) {
      const value = fn(item);
      if (!isPromise(value)) {
        // Synchronous result
        curValues.push(map(item, value));
      } else {
        ++state.waitingFor;

        const index = curValues.length;
        curValues.push(item);

        Promise.resolve(value)
          .then(result => {
            if (!state.active) return;

            setValues(prev => {
              const ret = Array.from(prev);
              ret.splice(index, 1, map(item, result));
              return ret;
            });
          })
          .catch(error => {
            if (!state.active) return;

            const name = (error as any)?.name ?? 'Error';
            const message = (error as any)?.message ?? 'Unknown error';

            setErrors(prev => [
              ...prev,
              {
                item,
                error: new Error(`${name} ${message}`),
              },
            ]);
          })
          .finally(() => {
            --state.waitingFor;
            if (state.active && state.waitingFor === 0) {
              setLoading(false);
            }
          });
      }
    }

    setLoading(state.waitingFor > 0);
    setValues(curValues);

    return () => {
      state.active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    loading,
    values,
    errors,
  };
}

function isPromise<T>(value: T | PromiseLike<T>): value is PromiseLike<T> {
  return typeof (value as any).then === 'function';
}
