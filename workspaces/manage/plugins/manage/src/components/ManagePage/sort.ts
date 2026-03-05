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

import { useCallback, useMemo } from 'react';

import { ManageStaticConfig } from '@backstage-community/plugin-manage-react';

import { WithNodeId } from './types';

export function sortComponents<T extends {}>(
  list: WithNodeId<T>[],
  sortOrder: Map<string, number>,
): WithNodeId<T>[] {
  return list.sort((a, b) => {
    const aOrder = sortOrder.get(a.nodeId);
    const bOrder = sortOrder.get(b.nodeId);
    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }
    if (aOrder !== undefined) {
      return -1;
    }
    if (bOrder !== undefined) {
      return 1;
    }
    return 0;
  });
}

export function useOrder(config: ManageStaticConfig) {
  const widgetOrderCards = useMemo(
    () => new Map(config.widgetOrderCards.map((id, index) => [id, index])),
    [config.widgetOrderCards],
  );
  const widgetOrderContentAbove = useMemo(
    () =>
      new Map(config.widgetOrderContentAbove.map((id, index) => [id, index])),
    [config.widgetOrderContentAbove],
  );
  const widgetOrderContentBelow = useMemo(
    () =>
      new Map(config.widgetOrderContentBelow.map((id, index) => [id, index])),
    [config.widgetOrderContentBelow],
  );
  const columnsOrder = useMemo(
    () => new Map(config.columnsOrder.map((id, index) => [id, index])),
    [config.columnsOrder],
  );

  const isContentFooter = useCallback(
    (id: string) => config.widgetOrderContentBelow.includes(id),
    [config.widgetOrderContentBelow],
  );

  return {
    widgetOrderCards,
    widgetOrderContentAbove,
    widgetOrderContentBelow,
    columnsOrder,
    isContentFooter,
  };
}
