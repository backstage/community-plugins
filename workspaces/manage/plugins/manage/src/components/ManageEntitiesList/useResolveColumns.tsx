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

import { useCallback } from 'react';

import type { Entity } from '@backstage/catalog-model';

import { ColumnInfo, TableColumn } from './types';
import { useColumnNodeIds } from './useColumnIds';
import { isManageColumnSimple, simplifyColumns } from './utils';
import { useResolveHooks } from '../../hooks/useResolveHooks';

/**
 * Resolves extension columns, which allow async loading of columns, each with
 * support for running hooks.
 *
 * To ensure the React hook contract of always running the same number of hooks
 * per component, it ensures uniqueness on the extension columns, then uses
 * useResolveHooks to run the hooks on the dynamic number of extension columns.
 *
 * The result is a set of columns to use in the table component, and a JSX
 * element used for resolving the dynamic number of hooks.
 */
export function useResolveColumns(
  entities: Entity[],
  columns: TableColumn[] | undefined,
) {
  const realColumns = useColumnNodeIds(columns);

  const params = useCallback(
    (col: TableColumn & { key: string }) => ({
      col,
      entities,
    }),
    [entities],
  );

  const { resolveHooksElement, result } = useResolveHooks({
    prop: 'key',
    data: realColumns,
    useHook: useColumnResolver,
    params,
  });

  return {
    resolveColumnsElement: resolveHooksElement,
    columns: result.flat().filter(v => !!v),
  };
}

function useColumnResolver({
  entities,
  col,
}: {
  entities: Entity[];
  col: TableColumn & { key: string };
}): ColumnInfo[] {
  if (isManageColumnSimple(col)) {
    return [
      {
        id: `col-${col.key}`,
        title: col.title,
        render(data) {
          return <col.component entity={data.entity} />;
        },
      },
    ];
  }

  return simplifyColumns(col)
    .getColumns(entities)
    .map((innerCol): ColumnInfo => {
      return {
        id: `col-${col.key}-${innerCol.id ?? innerCol.title}`,
        title: innerCol.title,
        render: innerCol.render,
      };
    });
}
