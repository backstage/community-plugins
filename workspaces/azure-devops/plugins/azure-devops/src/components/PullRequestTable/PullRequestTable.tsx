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
import {
  PullRequest,
  PullRequestStatus,
} from '@backstage-community/plugin-azure-devops-common';
import { useState, useEffect, useMemo } from 'react';

import { DateTime } from 'luxon';
import { PullRequestStatusButtonGroup } from '../PullRequestStatusButtonGroup';
import { useEntity } from '@backstage/plugin-catalog-react';
import { usePullRequests } from '../../hooks/usePullRequests';
import { RiGitPullRequestLine } from '@remixicon/react';

type PullRequestWithId = PullRequest & { id: string };

const columns: ColumnConfig<PullRequestWithId>[] = [
  {
    id: 'pullRequestId',
    label: 'ID',
    isRowHeader: true,
    isSortable: true,
    cell: (row: PullRequestWithId) => (
      <CellText title={row.pullRequestId?.toString() ?? '-'} />
    ),
  },
  {
    id: 'title',
    label: 'Title',
    isSortable: true,
    cell: (row: PullRequestWithId) => (
      <Cell>
        <Flex align="center" gap="small">
          <Link href={row.link ?? ''}>{row.title}</Link>
          {row.isDraft && (
            <Text
              variant="body-small"
              style={{
                border: '1px solid currentColor',
                padding: '2px 6px',
                borderRadius: '4px',
                opacity: 0.7,
                marginLeft: '12px',
              }}
            >
              Draft
            </Text>
          )}
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'sourceRefName',
    label: 'Source',
    isSortable: true,
    cell: (row: PullRequestWithId) => (
      <CellText title={row.sourceRefName ?? '-'} />
    ),
  },
  {
    id: 'targetRefName',
    label: 'Target',
    isSortable: true,
    cell: (row: PullRequestWithId) => (
      <CellText title={row.targetRefName ?? '-'} />
    ),
  },
  {
    id: 'createdBy',
    label: 'Created By',
    isSortable: true,
    cell: (row: PullRequestWithId) => <CellText title={row.createdBy ?? '-'} />,
  },
  {
    id: 'creationDate',
    label: 'Created',
    isSortable: true,
    cell: (row: PullRequestWithId) => (
      <CellText
        title={
          (row.creationDate
            ? DateTime.fromISO(row.creationDate)
            : DateTime.now()
          ).toRelative() ?? '-'
        }
      />
    ),
  },
];

type PullRequestTableProps = {
  defaultLimit?: number;
};

export const PullRequestTable = ({ defaultLimit }: PullRequestTableProps) => {
  const [pullRequestStatusState, setPullRequestStatusState] =
    useState<PullRequestStatus>(PullRequestStatus.Active);
  const { entity } = useEntity();

  const { items, loading, error } = usePullRequests(
    entity,
    defaultLimit,
    pullRequestStatusState,
  );

  // Transform items to include id property required by BUI Table
  const tableData = useMemo(
    () =>
      (items ?? []).map((item, index) => ({
        ...item,
        id: item.pullRequestId?.toString() ?? `pr-${index}`,
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
          item.pullRequestId?.toString().includes(lowerQuery) ||
          item.title?.toLowerCase().includes(lowerQuery) ||
          item.sourceRefName?.toLowerCase().includes(lowerQuery) ||
          item.targetRefName?.toLowerCase().includes(lowerQuery) ||
          item.createdBy?.toLowerCase().includes(lowerQuery),
      );
    },
    sortFn: (data, sort) => {
      if (!sort) return data;

      return [...data].sort((a, b) => {
        const aValue = a[sort.column as keyof PullRequestWithId];
        const bValue = b[sort.column as keyof PullRequestWithId];

        // Handle null/undefined values
        if (!aValue && !bValue) return 0;
        if (!aValue) return sort.direction === 'ascending' ? 1 : -1;
        if (!bValue) return sort.direction === 'ascending' ? -1 : 1;

        // Special handling for dates
        if (sort.column === 'creationDate') {
          const aDate = DateTime.fromISO(String(aValue));
          const bDate = DateTime.fromISO(String(bValue));
          const comparison = aDate.toMillis() - bDate.toMillis();
          return sort.direction === 'ascending' ? comparison : -comparison;
        }

        // Special handling for numbers (pullRequestId)
        if (sort.column === 'pullRequestId') {
          const comparison = Number(aValue) - Number(bValue);
          return sort.direction === 'ascending' ? comparison : -comparison;
        }

        // Compare values as strings
        const comparison = String(aValue).localeCompare(String(bValue));
        return sort.direction === 'ascending' ? comparison : -comparison;
      });
    },
    initialSort: { column: 'creationDate', direction: 'descending' },
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
            <RiGitPullRequestLine style={{ fontSize: 30 }} />
            <Text
              variant="title-small"
              weight="bold"
              style={{ paddingLeft: '5px' }}
            >
              Azure Repos - Pull Requests ({items ? items.length : 0})
            </Text>
          </Flex>
          <Flex style={{ marginLeft: 'auto', marginRight: '40px' }}>
            <PullRequestStatusButtonGroup
              status={pullRequestStatusState}
              setStatus={setPullRequestStatusState}
            />
          </Flex>
          <Flex justify="end" style={{ flex: '0 0 25%', minWidth: '200px' }}>
            <SearchField
              placeholder="Search pull requests..."
              value={search.value}
              onChange={search.onChange}
              aria-label="Search pull requests"
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
                <Skeleton width="8%" height={24} />
                <Skeleton width="30%" height={24} />
                <Skeleton width="15%" height={24} />
                <Skeleton width="15%" height={24} />
                <Skeleton width="18%" height={24} />
                <Skeleton width="14%" height={24} />
              </Flex>
            ))}
          </Flex>
        )}
        {!loading && (!items || items.length === 0) && (
          <Flex p="4" style={{ textAlign: 'center' }}>
            <Text as="p" variant="body-large">
              No pull requests found
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
