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
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQueryArrayState(
  key: string,
  defaultValue: string[] = [],
): [string[], (value: string[]) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const getArrayFromParam = useCallback((): string[] => {
    const raw = searchParams.get(key);
    return raw ? raw.split(',').filter(Boolean) : defaultValue;
  }, [key, searchParams, defaultValue]);

  const [state, setState] = useState<string[]>(() => getArrayFromParam());

  useEffect(() => {
    const value = getArrayFromParam();
    setState(prev => {
      const prevRaw = prev.join(',');
      const nextRaw = value.join(',');
      return prevRaw === nextRaw ? prev : value;
    });
  }, [getArrayFromParam]);

  const setValue = useCallback(
    (newValue: string[]) => {
      const newRaw = newValue.join(',');
      const currentRaw = searchParams.get(key);

      if (currentRaw === newRaw || (!currentRaw && newRaw === '')) return;

      setSearchParams(
        prev => {
          const params = new URLSearchParams(prev);
          if (newRaw === '') {
            params.delete(key);
          } else {
            params.set(key, newRaw);
          }
          return params;
        },
        { replace: true },
      );

      setState(newValue);
    },
    [key, searchParams, setSearchParams],
  );

  return [state, setValue];
}
