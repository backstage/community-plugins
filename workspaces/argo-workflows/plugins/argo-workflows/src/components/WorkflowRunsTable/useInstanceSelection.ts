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
import type { ArgoInstanceDetail } from '@backstage-community/plugin-argo-workflows-react';

export interface InstanceSelection {
  /** Names of every configured instance. */
  allNames: string[];
  /** Instances to query: the user's selection, or all of them by default. */
  selected: string[];
  /** Replaces the selection, ignoring any non-string keys from the Select. */
  select: (keys: unknown) => void;
  /** Restores the default of querying every instance. */
  selectAll: () => void;
  /** True when the user has narrowed the selection. */
  isFiltered: boolean;
  /** Instance name to display type, for the table's instance column. */
  typesByName: Map<string, string>;
}

/**
 * Manages which Argo instances the runs table queries.
 *
 * An explicit `instanceName` prop pins the selection to that instance; otherwise
 * the default is to query all of them.
 */
export function useInstanceSelection(
  availableInstances: ArgoInstanceDetail[] | undefined,
  instanceName: string | undefined,
): InstanceSelection {
  const allNames = useMemo(
    () => (availableInstances ?? []).map(instance => instance.name),
    [availableInstances],
  );

  const [selected, setSelected] = useState<string[]>(
    instanceName ? [instanceName] : allNames,
  );

  // `availableInstances` arrives asynchronously, so the initial state above is
  // often empty. Adopt the full list once it loads, unless pinned by prop or
  // already chosen by the user.
  useEffect(() => {
    if (instanceName || allNames.length === 0 || selected.length > 0) return;
    setSelected(allNames);
  }, [allNames, instanceName, selected.length]);

  const select = useCallback((keys: unknown) => {
    const values = Array.isArray(keys) ? keys : [keys];
    setSelected(
      values.filter((value): value is string => typeof value === 'string'),
    );
  }, []);

  const selectAll = useCallback(() => setSelected(allNames), [allNames]);

  const typesByName = useMemo(
    () =>
      new Map(
        (availableInstances ?? []).map(instance => [
          instance.name,
          instance.type,
        ]),
      ),
    [availableInstances],
  );

  // An empty selection means "not yet initialised", not "query nothing".
  const effective = selected.length > 0 ? selected : allNames;

  return {
    allNames,
    selected: effective,
    select,
    selectAll,
    isFiltered: effective.length < allNames.length,
    typesByName,
  };
}
