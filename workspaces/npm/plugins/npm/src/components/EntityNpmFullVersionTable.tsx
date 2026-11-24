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
import {
  Cell,
  CellText,
  type ColumnConfig,
  Flex,
  SearchField,
  Table,
  type TableProps,
  useTable,
} from '@backstage/ui';

import { NpmRegistryPackageInfo } from '@backstage-community/plugin-npm-common';

import { useTranslation } from '../hooks/useTranslation';
import { RelativePublishedAt } from './RelativePublishedAt';

interface Item {
  id: string;
  version: string;
  published?: string;
}

/**
 * Page content for the catalog (entity page) that shows two tables.
 * One for the latest tags and versions of a npm package.
 * And another one for the complete version history.
 *
 * @public
 */
export const EntityNpmFullVersionTable = ({
  packageInfo,
}: {
  packageInfo: NpmRegistryPackageInfo;
} & Omit<TableProps<Item>, 'columnConfig' | 'data' | 'pagination'>) => {
  const { t } = useTranslation();

  const columnConfig = useMemo<ColumnConfig<Item>[]>(() => {
    return [
      {
        id: 'version',
        label: t('versionHistoryCard.columns.version'),
        cell: item => <CellText title={item.version} />,
        isRowHeader: true,
      },
      {
        id: 'published',
        label: t('versionHistoryCard.columns.published'),
        cell: item => (
          <Cell>
            <RelativePublishedAt dateTime={item.published} />
          </Cell>
        ),
      },
    ];
  }, [t]);

  const data = useMemo<Item[]>(() => {
    const items: Item[] = [];

    // npmjs, GitHub has a time history, GitLab not
    if (packageInfo?.time) {
      for (const [version, published] of Object.entries(packageInfo.time)) {
        if (version === 'created' || version === 'modified') {
          continue;
        }
        items.push({ id: version, version, published });
      }
      items.reverse();
    } else if (packageInfo?.versions) {
      for (const [version, _releasePackageInfo] of Object.entries(
        packageInfo.versions,
      )) {
        items.push({ id: version, version });
      }
      items.reverse();
    }
    return items;
  }, [packageInfo]);

  const { tableProps, search } = useTable({
    mode: 'complete',
    data,
    paginationOptions: { type: 'page', pageSize: 10 },
    searchFn: (items, query) => {
      const lowerQuery = query.toLowerCase();
      return items.filter(item =>
        item.version.toLowerCase().includes(lowerQuery),
      );
    },
  });

  return (
    <Flex direction="column" gap="2">
      <SearchField
        aria-label={t('versionHistoryCard.toolbar.searchPlaceholder')}
        placeholder={t('versionHistoryCard.toolbar.searchPlaceholder')}
        {...search}
      />
      <Table columnConfig={columnConfig} {...tableProps} />
    </Flex>
  );
};
