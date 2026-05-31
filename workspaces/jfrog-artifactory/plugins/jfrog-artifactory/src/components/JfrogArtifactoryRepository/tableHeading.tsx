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
import {
  Cell,
  CellText,
  Flex,
  Tag,
  TagGroup,
  type ColumnConfig,
  type SortDescriptor,
} from '@backstage/ui';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

import { jfrogArtifactoryTranslationRef } from '../../translations';
import styles from './JfrogArtifactoryRepository.module.css';

export type RepositoryRowData = {
  id: string;
  name: string;
  repositories: string;
  manifestHash?: string;
  modified: string | Date;
  modifiedDisplay: string;
  size: string;
  sizeBytes: number;
};

const compareStrings = (a?: string, b?: string) =>
  (a ?? '').localeCompare(b ?? '');

const compareDates = (a: string | Date, b: string | Date) =>
  new Date(a).getTime() - new Date(b).getTime();

export const sortRepositoryRows = (
  items: RepositoryRowData[],
  sort: SortDescriptor,
) => {
  const sorted = [...items].sort((a, b) => {
    switch (String(sort.column)) {
      case 'name':
        return compareStrings(a.name, b.name);
      case 'repositories':
        return compareStrings(a.repositories, b.repositories);
      case 'manifestHash':
        return compareStrings(a.manifestHash, b.manifestHash);
      case 'modified':
        return compareDates(a.modified, b.modified);
      case 'size':
        return a.sizeBytes - b.sizeBytes;
      default:
        return 0;
    }
  });

  return sort.direction === 'ascending' ? sorted : sorted.reverse();
};

export const filterRepositoryRows = (
  items: RepositoryRowData[],
  query: string,
) => {
  if (!query) {
    return items;
  }

  const lowerQuery = query.toLowerCase();
  return items.filter(
    item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.repositories.toLowerCase().includes(lowerQuery) ||
      item.manifestHash?.toLowerCase().includes(lowerQuery) ||
      item.modifiedDisplay.toLowerCase().includes(lowerQuery) ||
      item.size.toLowerCase().includes(lowerQuery),
  );
};

export const getColumns = (
  t: TranslationFunction<typeof jfrogArtifactoryTranslationRef.T>,
): ColumnConfig<RepositoryRowData>[] => [
  {
    id: 'name',
    label: t('table.columns.version'),
    isRowHeader: true,
    isSortable: true,
    cell: row => <CellText title={row.name}>{row.name}</CellText>,
  },
  {
    id: 'repositories',
    label: t('table.columns.repositories'),
    isSortable: true,
    cell: row => (
      <CellText title={row.repositories}>{row.repositories}</CellText>
    ),
  },
  {
    id: 'manifestHash',
    label: t('table.columns.manifest'),
    isSortable: true,
    cell: row => (
      <Cell>
        <Flex align="center" className={styles.manifestDigest}>
          <TagGroup>
            <Tag size="small" className={styles.chip}>
              {t('manifest.sha256')}
            </Tag>
          </TagGroup>
          {row.manifestHash?.substring(0, 12)}
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'modified',
    label: t('table.columns.modified'),
    isSortable: true,
    cell: row => (
      <CellText title={row.modifiedDisplay}>{row.modifiedDisplay}</CellText>
    ),
  },
  {
    id: 'size',
    label: t('table.columns.size'),
    isSortable: true,
    cell: row => <CellText title={row.size}>{row.size}</CellText>,
  },
];
