/*
 * Copyright 2024 The Backstage Authors
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

import { useMemo, useCallback } from 'react';
import { useQueryState } from './useQueryState';
import { INCIDENT_STATE_MAP, PRIORITY_MAP } from '../utils/incidentUtils';
import { SelectItem } from '@backstage/core-components';

export const useQueryArrayFilter = (filterName: 'state' | 'priority') => {
  const [raw, setRaw] = useQueryState<string>(filterName, '');
  const [, setOffset] = useQueryState<number>('offset', 0);

  const map = filterName === 'state' ? INCIDENT_STATE_MAP : PRIORITY_MAP;

  const current: SelectItem[] = useMemo(() => {
    return raw
      .split(',')
      .filter(v => v !== '')
      .map(value => ({
        value,
        label: map[Number(value)]?.label,
      }))
      .filter(item => item.label);
  }, [raw, map]);

  const set = useCallback(
    (newValues: (string | number)[]) => {
      const joined = newValues.join(',');
      setRaw(joined);
      setOffset(0);
    },
    [setRaw, setOffset],
  );

  const clear = useCallback(() => {
    setRaw('');
    setOffset(0);
  }, [setRaw, setOffset]);

  return useMemo(
    () =>
      ({
        current,
        set,
        clear,
      } as const),
    [current, set, clear],
  );
};
