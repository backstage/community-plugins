/*
 * Copyright 2026 The Backstage Authors
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

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseResolveHooksOptions<
  T extends { [K in Prop]: string },
  R,
  Prop extends string,
  Params extends (item: T) => any = (item: T) => T,
> {
  prop: Prop;
  data: T[];
  useHook: (item: ReturnType<Params>) => R;
  params?: Params;
}

export interface UseResolveHooksResult<R> {
  resolveHooksElement: JSX.Element;
  result: (R | undefined)[];
}

const identity = (v: any) => v;

/**
 * This hook provides a way of running hooks on elements of an array of dynamic
 * (changing) size.
 *
 * The simplest way of doing this (for loop) breaks the hook contract in React.
 * To solve this, a dynamic amount of _components_ are mounted, each running 1
 * hook, propagating the hook result upstream. The result this then merged into
 * an array of results.
 *
 * The argument should contain a list of items to use as input for the hooks,
 * a 'prop' to use for identifying a unique string in each item, and the hook to
 * invoke. Optionally a 'params' function can be provided, which allows
 * transforming each item into a new object to use as input for the hooks.
 *
 * All these inputs must be stable (memoed), or the hook will cause an infinite
 * refresh loop.
 *
 * The return value contains the hook results and a JSX element to be mounted
 * somewhere.
 */
export function useResolveHooks<
  Prop extends string,
  T extends { [K in Prop]: string },
  R,
  Params extends (item: T) => any = (item: T) => T,
>(
  options: UseResolveHooksOptions<T, R, Prop, Params>,
): UseResolveHooksResult<R> {
  const { prop, data, useHook, params = identity as Params } = options;

  const [results, setResults] = useState<Record<string, R>>({});

  // Clear the hooks result state from stale data when the input array changes
  useEffect(() => {
    setResults(prev =>
      Object.fromEntries(
        data
          .map(item => [item[prop], prev[item[prop]]])
          .filter(([, v]) => v !== undefined),
      ),
    );
  }, [prop, data]);

  // Set one hook result
  const setResult = useCallback(
    (item: T, result: R) => {
      setResults(prev => {
        if (prev[item[prop]] === result) return prev;
        return { ...prev, [item[prop]]: result };
      });
    },
    [prop],
  );

  const resolveHooksElement: JSX.Element = useMemo(() => {
    return (
      <>
        {data.map(item => (
          <ResolveHook
            key={item[prop]}
            useHook={useHook}
            params={params}
            item={item}
            setResult={setResult}
          />
        ))}
      </>
    );
  }, [data, setResult, prop, useHook, params]);

  const result = useMemo(
    () => data.map(item => results[item[prop]]),
    [prop, data, results],
  );

  return { resolveHooksElement, result };
}

interface ResolveHookParams<T, R, Params extends (item: T) => any> {
  useHook: (item: ReturnType<Params>) => R;
  params: Params;
  item: T;
  setResult: (item: T, result: R) => void;
}

function ResolveHook<T, R, Params extends (item: T) => any>(
  props: ResolveHookParams<T, R, Params>,
) {
  const { useHook, item, params, setResult } = props;

  const result = useHook(params(item));

  useEffect(() => {
    setResult(item, result);
  }, [item, result, setResult]);

  return null;
}
