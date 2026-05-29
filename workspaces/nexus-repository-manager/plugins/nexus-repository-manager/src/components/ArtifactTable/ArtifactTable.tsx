import { useMemo } from 'react';

import { Link, Table, type TableColumn } from '@backstage/core-components';
import { Flex, Tag, TagGroup } from '@backstage/ui';

import { formatByteSize } from '../../utils/format-byte-size/format-byte-size';
import { useTranslation } from '../../hooks/useTranslation';

import type { AssetHash } from '../../types';

import styles from './ArtifactTable.module.css';

export type ArtifactRowData = {
  id?: string;
  version?: string;
  artifact?: string;
  assetVariants: Set<string>;
  repositoryType?: string;
  hash?: AssetHash;
  lastModified?: string;
  sizeBytes?: number;
};

export const ArtifactTable = ({
  artifacts,
  title,
}: {
  artifacts: ArtifactRowData[];
  title: string;
}) => {
  const { t } = useTranslation();

  const columns: TableColumn<ArtifactRowData>[] = useMemo(
    () => [
      {
        title: t('table.columns.version'),
        field: 'version',
        type: 'string',
        highlight: true,
      },
      {
        title: t('table.columns.artifact'),
        field: 'artifact',
        type: 'string',
        render: rowData => (
          <>
            {rowData.artifact}
            <Flex className={styles.variants} direction="row" align="center">
              <TagGroup>
                {/* sort/reverse for stable order, and so we get `jar +sources` */}
                {[...rowData.assetVariants]
                  .sort((a, b) => a.localeCompare(b))
                  .reverse()
                  .map(variant => (
                    <Tag key={variant} className={styles.chip}>
                      {variant}
                    </Tag>
                  ))}
              </TagGroup>
            </Flex>
          </>
        ),
      },
      {
        title: t('table.columns.repositoryType'),
        field: 'repositoryType',
        type: 'string',
      },
      {
        title: t('table.columns.checksum'),
        field: 'hash',
        emptyValue: t('table.emptyValue'),
        render: rowData => (
          <Flex direction="row" align="center" gap="1">
            <span className={styles.algorithmChip}>
              {rowData.hash?.algorithm}
            </span>
            {rowData.hash?.value.slice(0, 12)}
          </Flex>
        ),
        customFilterAndSearch: (term, rowData) => {
          if (!rowData.hash) {
            return false;
          }
          return rowData.hash.value.includes(term);
        },
        customSort: (a, b) => {
          if (!a.hash) {
            return -1;
          }
          if (!b.hash) {
            return 1;
          }
          if (a.hash.value === b.hash.value) {
            return 0;
          }
          return a.hash.value < b.hash.value ? -1 : 1;
        },
      },
      {
        title: t('table.columns.modified'),
        field: 'lastModified',
        type: 'string',
      },
      {
        title: t('table.columns.size'),
        field: 'sizeBytes',
        render: rowData => formatByteSize(rowData.sizeBytes),
      },
    ],
    [t],
  );

  return (
    <Table
      title={t('table.title', { title } as Record<string, string>)}
      options={{ paging: true, padding: 'dense' }}
      data={artifacts}
      columns={columns}
      localization={{
        toolbar: { searchPlaceholder: t('table.searchPlaceholder') },
        pagination: { labelRowsSelect: t('table.labelRowsSelect') },
      }}
      emptyContent={
        <div
          className={styles.empty}
          data-testid="nexus-repository-manager-empty-table"
        >
          {t('table.emptyContent.message')}&nbsp;
          <Link to="https://github.com/backstage/community-plugins/tree/main/workspaces/nexus-repository-manager/plugins/nexus-repository-manager/ANNOTATIONS.md">
            {t('table.emptyContent.linkText')}
          </Link>
          .
        </div>
      }
    />
  );
};
