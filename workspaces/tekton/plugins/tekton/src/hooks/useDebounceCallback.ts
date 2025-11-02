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

import { useRef, useMemo } from 'react';

import { debounce } from 'lodash';

import { useDeepCompareMemoize } from './useDeepCompareMemoize';

interface Cancelable {
  cancel(): void;
  flush(): void;
}

export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  timeout: number = 500,
  debounceParams: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {
    leading: false,
    trailing: true,
  },
): ((...args: any) => any) & Cancelable => {
  const memDebounceParams = useDeepCompareMemoize(debounceParams);
  const callbackRef = useRef<T>();
  callbackRef.current = callback;

  return useMemo(() => {
    return debounce(
      (...args) => callbackRef.current?.(...args),
      timeout,
      memDebounceParams,
    );
  }, [memDebounceParams, timeout]);
};
