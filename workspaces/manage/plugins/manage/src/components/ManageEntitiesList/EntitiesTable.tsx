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

import { useEffect, useMemo, useState } from 'react';

import { upperFirst } from 'lodash';

import {
  Table as TableRoot,
  useTable,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  TablePagination,
  Text,
  Grid,
  Box,
  Flex,
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
      <Box
        style={{
          marginTop: 'calc(0px - var(--bui-space-1))',
          marginBottom: 'calc(0px - var(--bui-space-1))',
        }}
      >
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

  const [offset, setOffset] = useState(0);

  // Reset offset on tab switch
  useEffect(() => {
    setOffset(0);
  }, [kind, starred]);

  const { data: paginatedData, paginationProps } = useTable({
    data,
    pagination: {
      onNextPage() {
        setOffset(offset + pageSize);
      },
      onPreviousPage() {
        setOffset(offset - pageSize);
      },
      onPageSizeChange(newPageSize) {
        setPageSize(newPageSize);
      },
      pageSize,
      // TODO: Enable this when supported, e.g if
      //       https://github.com/backstage/backstage/pull/32219 is merged.
      // pageSizeOptions,
      offset,
      showPageSizeOptions: paging,
    },
  });

  const table = (
    <>
      <Grid.Root columns="1" gap="0">
        <Grid.Item>
          <Text variant="title-small">{tableTitle}</Text>
          <br />
          <Text variant="body-small" color="secondary">
            {tableSubtitle}
          </Text>
        </Grid.Item>
      </Grid.Root>
      <Box width="100%" style={{ overflowX: 'auto' }}>
        <TableRoot style={{ minWidth: '100%', tableLayout: 'auto' }}>
          <TableHeader>
            {buiColumns.map((col, index) => (
              <Column isRowHeader key={`col-${index}`}>
                {col.title}
              </Column>
            ))}
          </TableHeader>
          <TableBody>
            {paginatedData?.map(item => (
              <Row key={item.id}>
                {buiColumns.map((col, index) => (
                  <Cell key={`cell-${item.id}-${index}`}>
                    {col.render(item)}
                  </Cell>
                ))}
              </Row>
            ))}
          </TableBody>
        </TableRoot>
      </Box>
      <TablePagination {...paginationProps} />
    </>
  );

  return table;
}
