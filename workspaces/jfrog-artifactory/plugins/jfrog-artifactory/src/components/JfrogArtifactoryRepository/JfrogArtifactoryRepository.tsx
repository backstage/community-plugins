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
import { useMemo } from 'react';
import { useAsync } from 'react-use';

import { Link, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  Flex,
  Header,
  PageSizeOption,
  SearchField,
  Table,
  Text,
  useTable,
} from '@backstage/ui';

import { jfrogArtifactoryApiRef } from '../../api';
import { Edge } from '../../types';
import {
  filterRepositoryRows,
  getColumns,
  RepositoryRowData,
  sortRepositoryRows,
} from './tableHeading';
import { formatByteSize, formatDate, parseSizeBytes } from '../../utils';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './JfrogArtifactoryRepository.module.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];
const DEFAULT_PAGE_SIZE = 10;

export function JfrogArtifactoryRepository({
  image,
  target,
  repoFilter,
}: RepositoryProps) {
  const jfrogArtifactoryClient = useApi(jfrogArtifactoryApiRef);
  const { t } = useTranslation();
  const title = t('page.title', { image } as Record<string, string>);

  const { loading, value: tagsResponse } = useAsync(async () => {
    return jfrogArtifactoryClient.getTags(image, target, repoFilter);
  }, [jfrogArtifactoryClient, image, target, repoFilter]);

  const data = useMemo<RepositoryRowData[]>(() => {
    const edges = tagsResponse?.data.versions.edges ?? [];
    return edges.map((edge: Edge) => {
      const sizeBytes = parseSizeBytes(edge.node.size);

      return {
        id: edge.node.name,
        name: edge.node.name,
        repositories:
          `${edge.node.repos.length}` +
          ' | ' +
          `${edge.node.repos.map(repo => repo.name).join('| ')}`,
        manifestHash: edge.node.files.find(
          manifest => manifest.name === 'manifest.json',
        )?.sha256,
        modified: edge.node.modified,
        modifiedDisplay: formatDate(edge.node.modified),
        size: formatByteSize(sizeBytes),
        sizeBytes,
      };
    });
  }, [tagsResponse]);

  const columns = useMemo(() => getColumns(t), [t]);

  const pageSizeOptions = useMemo<PageSizeOption[]>(
    () =>
      PAGE_SIZE_OPTIONS.map(value => ({
        value,
        label: t('table.pagination.showResults', {
          count: String(value),
        } as Record<string, string>),
      })),
    [t],
  );

  const paginationOptions = useMemo(
    () => ({
      pageSize: DEFAULT_PAGE_SIZE,
      showPageSizeOptions: true,
      pageSizeOptions,
      getLabel: ({
        pageSize,
        offset,
        totalCount,
      }: {
        pageSize: number;
        offset?: number;
        totalCount?: number;
      }) => {
        const fromCount = (offset ?? 0) + 1;
        const toCount = Math.min((offset ?? 0) + pageSize, totalCount ?? 0);

        return t('table.pagination.rangeLabel', {
          start: String(fromCount),
          end: String(toCount),
          total: String(totalCount ?? 0),
        } as Record<string, string>);
      },
    }),
    [pageSizeOptions, t],
  );

  const { tableProps, search } = useTable({
    mode: 'complete',
    data,
    searchFn: filterRepositoryRows,
    sortFn: sortRepositoryRows,
    paginationOptions,
  });

  if (loading) {
    return <Progress />;
  }

  return (
    <div
      className={styles.tableContainer}
      data-testid="jfrog-artifactory-table"
    >
      <Header
        title={title}
        customActions={
          <Flex className={styles.searchBar}>
            <SearchField
              aria-label={t('table.searchPlaceholder')}
              placeholder={t('table.searchPlaceholder')}
              value={search.value}
              onChange={search.onChange}
              style={{ width: '100%' }}
            />
          </Flex>
        }
      />
      <Table
        aria-label={title}
        columnConfig={columns}
        emptyState={
          <div className={styles.empty}>
            <Text>
              {t('table.emptyContent.message')}&nbsp;
              <Link to="https://backstage.io/">
                {t('table.emptyContent.learnMore')}
              </Link>
            </Text>
          </div>
        }
        {...tableProps}
      />
    </div>
  );
}

interface RepositoryProps {
  image: string;
  target?: string;
  repoFilter?: string;
}
