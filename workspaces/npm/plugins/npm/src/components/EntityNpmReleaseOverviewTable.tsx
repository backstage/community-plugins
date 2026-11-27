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
import { Entity } from '@backstage/catalog-model';
import {
  Cell,
  CellText,
  type ColumnConfig,
  Table,
  type TableProps,
  useTable,
} from '@backstage/ui';

import {
  NpmAnnotation,
  NpmRegistryPackageInfo,
} from '@backstage-community/plugin-npm-common';

import { useTranslation } from '../hooks/useTranslation';
import { RelativePublishedAt } from './RelativePublishedAt';

interface Item {
  id: string;
  tag: string;
  version: string;
  published?: string;
}

/**
 * Table for the catalog (entity page) that shows the latest tags
 * with their version number and the release date.
 *
 * @public
 */
export const EntityNpmReleaseOverviewTable = ({
  entity,
  packageInfo,
}: {
  entity: Entity;
  packageInfo: NpmRegistryPackageInfo;
} & Omit<TableProps<Item>, 'columnConfig' | 'data' | 'pagination'>) => {
  const { t } = useTranslation();

  const columnConfig = useMemo<ColumnConfig<Item>[]>(() => {
    return [
      {
        id: 'tag',
        label: t('releaseOverviewCard.columns.tag'),
        cell: item => <CellText title={item.tag} />,
        isRowHeader: true,
      },
      {
        id: 'version',
        label: t('releaseOverviewCard.columns.version'),
        cell: item => <CellText title={item.version} />,
      },
      {
        id: 'published',
        label: t('releaseOverviewCard.columns.published'),
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

    const showTags = entity.metadata.annotations?.[NpmAnnotation.SHOW_TAGS]
      ?.split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (packageInfo?.['dist-tags']) {
      for (const [tag, version] of Object.entries(packageInfo['dist-tags'])) {
        if (showTags && showTags.length > 0 && !showTags.includes(tag)) {
          continue;
        }
        const published = packageInfo.time?.[version];
        items.push({ id: tag, tag, version, published });
      }
    }

    return items;
  }, [entity, packageInfo]);

  const { tableProps } = useTable({
    mode: 'complete',
    data,
    paginationOptions: { type: 'none' },
  });

  return <Table columnConfig={columnConfig} {...tableProps} />;
};
