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
import React from 'react';

import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  ErrorPanel,
  Table,
  type TableColumn,
} from '@backstage/core-components';

import { NpmAnnotation } from '@backstage-community/plugin-npm-common';

import Box from '@material-ui/core/Box';

import { usePackageInfo } from '../hooks/usePackageInfo';
import { useTranslation } from '../hooks/useTranslation';
import { RelativePublishedAt } from './RelativePublishedAt';
import { Trans } from './Trans';

interface TagRow {
  tag: string;
  version: string;
  published?: string;
}

interface TableData {
  version: string;
  published?: string;
}

const tagColumns: TableColumn<TagRow>[] = [
  {
    title: <Trans message="releaseTableCard.columns.tag" params={{}} />,
    field: 'tag',
    type: 'string',
  },
  {
    title: <Trans message="releaseTableCard.columns.version" params={{}} />,
    field: 'version',
    type: 'string',
  },
  {
    title: <Trans message="releaseTableCard.columns.published" params={{}} />,
    field: 'published',
    type: 'datetime',
    render: row => <RelativePublishedAt dateTime={row.published} />,
  },
];

const columns: TableColumn<TableData>[] = [
  {
    title: <Trans message="versionHistoryCard.columns.version" params={{}} />,
    field: 'version',
    type: 'string',
  },
  {
    title: <Trans message="versionHistoryCard.columns.published" params={{}} />,
    field: 'published',
    type: 'datetime',
    render: row => <RelativePublishedAt dateTime={row.published} />,
  },
];

/**
 * Page content for the catalog (entity page) that shows two tables.
 * One for the latest tags and versions of a npm package.
 * And another one for the complete version history.
 *
 * @public
 */
export const EntityNpmReleaseTableCard = () => {
  const { entity } = useEntity();
  const { packageInfo, loading, error } = usePackageInfo();
  const { t } = useTranslation();

  const packageName = entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];
  const showTags = entity.metadata.annotations?.[NpmAnnotation.SHOW_TAGS]
    ?.split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!packageName) {
    return (
      <MissingAnnotationEmptyState
        annotation={NpmAnnotation.PACKAGE_NAME}
        readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format"
      />
    );
  }

  const tagData: TagRow[] = [];
  if (packageInfo?.['dist-tags']) {
    for (const [tag, version] of Object.entries(packageInfo['dist-tags'])) {
      if (showTags && showTags.length > 0 && !showTags.includes(tag)) {
        continue;
      }
      const published = packageInfo.time?.[version];
      tagData.push({ tag, version, published });
    }
  }

  const data: TableData[] = [];
  // npmjs, GitHub has a time history, GitLab not
  if (packageInfo?.time) {
    for (const [version, published] of Object.entries(packageInfo.time)) {
      if (version === 'created' || version === 'modified') {
        continue;
      }
      data.push({ version, published });
    }
    data.reverse();
  } else if (packageInfo?.versions) {
    for (const [version, _releasePackageInfo] of Object.entries(
      packageInfo.versions,
    )) {
      data.push({ version });
    }
    data.reverse();
  }

  const emptyContent = error ? (
    <Box padding={1}>
      <ErrorPanel error={error} />
    </Box>
  ) : null;

  // TODO: export both tables as cards and rename `EntityNpmReleaseTableCard` to `EntityNpmReleaseContent` or `NpmReleaseEntityContent`
  return (
    <>
      <Table
        title={t('releaseTableCard.title')}
        options={{ paging: false, padding: 'dense' }}
        localization={{
          toolbar: {
            searchPlaceholder: t('releaseTableCard.toolbar.searchPlaceholder'),
          },
        }}
        isLoading={loading}
        data={tagData}
        columns={tagColumns}
        emptyContent={emptyContent}
      />
      <br />
      <br />
      <Table
        title={t('versionHistoryCard.title')}
        options={{ paging: true, pageSize: 10, padding: 'dense' }}
        localization={{
          toolbar: {
            searchPlaceholder: t(
              'versionHistoryCard.toolbar.searchPlaceholder',
            ),
          },
        }}
        isLoading={loading}
        data={data}
        columns={columns}
        emptyContent={emptyContent}
      />
    </>
  );
};
