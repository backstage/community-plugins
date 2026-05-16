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

import { useMemo } from 'react';

import { useCurrentTab } from '@backstage-community/plugin-manage-react';

const emptyList: any[] = [];

/**
 * Ensures a list of objects have 'key' properties, using 'nodeId' or 'id' if
 * such exists, otherwise creates a unique one per object.
 *
 * It prepends the current tab, as though a nodeId representing single or
 * multiple columns will be stable, it's only per tab.
 * This ensures uniqueness for useResolveHooks, to get the same number of hooks
 * running every time.
 *
 * @internal
 */
export function useColumnNodeIds<T extends {}>(
  columns: T[] | undefined,
): (T & { key: string })[] {
  const tab = useCurrentTab();

  return useMemo(() => {
    const output = (columns ?? emptyList) as (T & { key: string })[];

    return output.map(item => ({ ...item, key: getNodeId(tab, item) }));
  }, [tab, columns]);
}

function getNodeId(tab: string, obj: {}): string {
  const o = obj as { nodeId?: string; id?: string; key?: string };

  if (typeof o.key === 'string') {
    return o.key;
  }

  if (typeof o.nodeId === 'string') {
    return `${tab}-${o.nodeId}`;
  } else if (typeof o.id === 'string') {
    return `${tab}-${o.id}`;
  }
  // Fallback for the old frontend system, where columns don't have node id's
  return `id-${tab}-${Math.random()}`;
}
