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

import { useEffect, useMemo } from 'react';

import { upperFirst } from 'lodash';

import {
  Table,
  useTable,
  Cell,
  Text,
  Box,
  Flex,
  ColumnConfig,
} from '@backstage/ui';
import { TableOptions as MuiTableOptions } from '@backstage/core-components';
import {
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

import {
  useCurrentKindTitle,
  pluralizeKind,
} from '@backstage-community/plugin-manage-react';

import {
  defaultPageSize,
  useEntitesTablePageSize,
  useSetEntitesTablePageSize,
} from './table-settings';
import { ColumnInfo, TableRow } from './types';
import { LifecycleIcon } from './LifecycleIcon';
import styles from './EntitiesTable.module.css';

/** @public */
export interface TableOptions {
  pageSizeOptions?: number[];
  paging?: boolean;
}

/** @internal */
export interface EntitiesTableProps {
  columns: ColumnInfo[];
  options?: MuiTableOptions<TableRow> | TableOptions;
  title?: string;
  subtitle?: string;
  kind?: string;
  starred?: boolean;
  entities: Entity[];
}

const defaultPageSizeOptions = [defaultPageSize, 20, 30, 40, 50, 100];

/** @internal */
export function EntitiesTable(props: EntitiesTableProps) {
  const { columns, kind, starred, options, entities, title, subtitle } = props;

  const buiColumns: ColumnInfo[] = [];

  const addColumn = (columnInfo: ColumnInfo) => {
    buiColumns.push(columnInfo);
  };

  if (kind === undefined) {
    addColumn({
      id: 'kind',
      title: 'Kind',
      render: data => data.entity.kind,
    });
  }

  function TitleCell({ tableRow: { entity } }: { tableRow: TableRow }) {
    return (
      <Box className={styles.manageEntitiesTableTitleCell}>
        <Flex direction="column" gap="0">
          <EntityRefLink entityRef={entity} hideIcon={!!kind} />
          <Text variant="body-x-small">
            <EntityRefLink
              title={entity.metadata.name}
              hideIcon
              entityRef={entity}
              color="textSecondary"
            />
          </Text>
        </Flex>
      </Box>
    );
  }

  addColumn({
    header: true,
    id: kind ? kind : 'name',
    title: kind ? upperFirst(kind) : 'Name',
    render: data => <TitleCell tableRow={data} />,
  });

  if (kind === 'component' || kind === 'api') {
    addColumn({
      id: 'type',
      title: 'Type',
      render: data => {
        const type =
          typeof data.entity.spec?.type === 'string'
            ? data.entity.spec?.type
            : '';
        return (
          <>
            <LifecycleIcon entity={data.entity} />
            {type}
          </>
        );
      },
    });
  }

  addColumn({
    id: 'owner',
    title: 'Owner',
    render: data => {
      if (data.entity.spec?.owner) {
        const owner = parseEntityRef(`${data.entity.spec.owner}`, {
          defaultKind: 'group',
        });
        return <EntityRefLink entityRef={owner} />;
      }
      return <></>;
    },
  });

  columns.forEach(col => {
    addColumn(col);
  });

  const data: TableRow[] = useMemo(
    () =>
      entities.map(entity => ({
        entity,
        id: stringifyEntityRef(entity),
      })),
    [entities],
  );

  const pageSizeOptions = options?.pageSizeOptions ?? defaultPageSizeOptions;
  const pageSize = useEntitesTablePageSize() ?? defaultPageSize;
  const setPageSize = useSetEntitesTablePageSize();
  const paging = options?.paging ?? pageSizeOptions[0] < data.length;

  const kindTitle = useCurrentKindTitle();
  const tableTitle = title ?? `Your ${kindTitle}`;
  const tableSubtitle =
    subtitle ??
    `These ${
      kind ? pluralizeKind(kind) : 'entities'
    } are owned by you, or groups you belong to`;

  const { tableProps, reload } = useTable({
    mode: 'complete',
    data,
    paginationOptions: {
      pageSize,
      onPageSizeChange(size) {
        setPageSize(size);
      },
      showPageSizeOptions: paging,
      pageSizeOptions,
    },
  });

  // Reset offset on tab switch by reloading the table (it implicitly resets the
  // offset to 0)
  useEffect(() => {
    reload();
  }, [kind, starred, reload]);

  const tableColumns: ColumnConfig<TableRow>[] = buiColumns.map(col => ({
    id: col.id,
    label: col.title,
    isRowHeader: col.header,
    cell: item => <Cell>{col.render(item)}</Cell>,
  }));

  const table = (
    <>
      <Flex direction="column" gap="0">
        <Text variant="title-small">{tableTitle}</Text>
        <Text variant="body-small" color="secondary">
          {tableSubtitle}
        </Text>
      </Flex>
      <Table
        className={styles.manageEntitiesTable}
        columnConfig={tableColumns}
        {...tableProps}
      />
    </>
  );

  return table;
}
