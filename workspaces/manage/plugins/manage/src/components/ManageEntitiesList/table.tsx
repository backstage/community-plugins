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

import { TableOptions as MuiTableOptions } from '@backstage/core-components';

import {
  KindStarred,
  useOwnedEntities,
} from '@backstage-community/plugin-manage-react';

import { EntitiesTablePageSizeProvider } from './table-settings';
import { TableColumn, TableRow } from './types';
import { EntitiesTable } from './EntitiesTable';
import { useResolveColumns } from './useResolveColumns';

/** @public */
export interface TableOptions {
  pageSizeOptions?: number[];
  paging?: boolean;
}

/** @public */
export interface ManageEntitiesTableProps {
  columns?: TableColumn[];
  options?: MuiTableOptions<TableRow> | TableOptions;
  title?: string;
  subtitle?: string;
}

/**
 * Props for the {@link ManageEntitiesTable} component.
 *
 * @public
 */
export interface ManageEntitiesTableSpecificProps
  extends ManageEntitiesTableProps {
  kind?: string;
  starred?: boolean;
}

function useTableData({
  kind,
  starred,
  subtitle,
}: ManageEntitiesTableSpecificProps) {
  const kindEntities = useOwnedEntities(kind);
  const starredEntities = useOwnedEntities(KindStarred);

  return starred
    ? { entities: starredEntities, subtitle: '', kind: undefined }
    : { entities: kindEntities, subtitle, kind };
}

/**
 * The table that shows entities of a certain kind (or all kinds, or starred
 * entities)
 *
 * @public
 */
export function ManageEntitiesTable(props: ManageEntitiesTableSpecificProps) {
  const { entities, subtitle, kind } = useTableData(props);

  const { resolveColumnsElement, columns } = useResolveColumns(
    entities,
    props.columns,
  );

  return (
    <>
      {resolveColumnsElement}
      <EntitiesTablePageSizeProvider>
        <EntitiesTable
          columns={columns}
          options={props.options}
          kind={kind}
          entities={entities}
          subtitle={subtitle}
        />
      </EntitiesTablePageSizeProvider>
    </>
  );
}
