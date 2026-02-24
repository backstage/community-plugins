/*
 * Copyright 2021 The Backstage Authors
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

import {
  Card,
  CardHeader,
  CardBody,
  Cell,
  CellText,
  Flex,
  Link,
  SearchField,
  Skeleton,
  Table,
  Text,
  useTable,
  type ColumnConfig,
} from '@backstage/ui';
import { ResponseErrorPanel } from '@backstage/core-components';
import { GitTag } from '@backstage-community/plugin-azure-devops-common';

import { RiPriceTag3Line } from '@remixicon/react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGitTags } from '../../hooks/useGitTags';
import { useEffect, useMemo } from 'react';

type GitTagWithId = GitTag & { id: string };

const columns: ColumnConfig<GitTagWithId>[] = [
  {
    id: 'name',
    label: 'Tag',
    isRowHeader: true,
    isSortable: true,
    cell: (row: GitTagWithId) => (
      <Cell>
        <Flex align="center">
          <Link href={row.link ?? ''}>{row.name}</Link>
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'peeledObjectId',
    label: 'Commit',
    isSortable: true,
    cell: (row: GitTagWithId) => (
      <Cell>
        <Flex align="center">
          <Link href={row.commitLink ?? ''}>{row.peeledObjectId}</Link>
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'createdBy',
    label: 'Created By',
    isSortable: true,
    cell: (row: GitTagWithId) => <CellText title={row.createdBy ?? '-'} />,
  },
];

export const GitTagTable = () => {
  const { entity } = useEntity();

  const { items, loading, error } = useGitTags(entity);

  // Transform items to include id property required by BUI Table
  const tableData = useMemo(
    () =>
      (items ?? []).map((item, index) => ({
        ...item,
        id: item.objectId ?? item.name ?? `tag-${index}`,
      })),
    [items],
  );

  const { tableProps, reload, search } = useTable({
    mode: 'complete',
    getData: () => tableData,
    searchFn: (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter(
        item =>
          item.name?.toLowerCase().includes(lowerQuery) ||
          item.peeledObjectId?.toLowerCase().includes(lowerQuery) ||
          item.createdBy?.toLowerCase().includes(lowerQuery),
      );
    },
    sortFn: (data, sort) => {
      if (!sort) return data;

      return [...data].sort((a, b) => {
        const aValue = a[sort.column as keyof GitTagWithId];
        const bValue = b[sort.column as keyof GitTagWithId];

        // Handle null/undefined values
        if (!aValue && !bValue) return 0;
        if (!aValue) return sort.direction === 'ascending' ? 1 : -1;
        if (!bValue) return sort.direction === 'ascending' ? -1 : 1;

        // Compare values
        const comparison = String(aValue).localeCompare(String(bValue));
        return sort.direction === 'ascending' ? comparison : -comparison;
      });
    },
    initialSort: { column: 'name', direction: 'descending' },
  });

  useEffect(() => {
    reload();
  }, [tableData, reload]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <Flex align="center" justify="between" gap="small">
          <Flex align="center" gap="small">
            <RiPriceTag3Line style={{ fontSize: 30 }} />
            <Text
              variant="title-small"
              weight="bold"
              style={{ paddingLeft: '5px' }}
            >
              Azure Repos - Git Tags ({items ? items.length : 0})
            </Text>
          </Flex>
          <Flex justify="end" style={{ flex: '0 0 25%', minWidth: '200px' }}>
            <SearchField
              placeholder="Search tags..."
              value={search.value}
              onChange={search.onChange}
              aria-label="Search git tags"
              style={{ width: '100%' }}
            />
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        {loading && (
          <Flex direction="column" gap="3" style={{ width: '100%' }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Flex
                key={index}
                gap="4"
                align="center"
                style={{ width: '100%' }}
              >
                <Skeleton width="30%" height={24} />
                <Skeleton width="40%" height={24} />
                <Skeleton width="30%" height={24} />
              </Flex>
            ))}
          </Flex>
        )}
        {!loading && (!items || items.length === 0) && (
          <Flex p="4" style={{ textAlign: 'center' }}>
            <Text as="p" variant="body-large">
              No git tags found
            </Text>
          </Flex>
        )}
        {!loading && items && items.length > 0 && (
          <Table columnConfig={columns} {...tableProps} />
        )}
      </CardBody>
    </Card>
  );
};
