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
import { DateTime } from 'luxon';

import { usePackageInfo } from '../hooks/usePackageInfo';

interface TagRow {
  tag: string;
  version: string;
  published?: string;
}

const tagColumns: TableColumn<TagRow>[] = [
  {
    title: 'Tag',
    field: 'tag',
    type: 'string',
  },
  {
    title: 'Version',
    field: 'version',
    type: 'string',
  },
  {
    title: 'Published',
    field: 'published',
    type: 'datetime',
    render: row =>
      row.published ? (
        <time dateTime={row.published} title={row.published}>
          {DateTime.fromISO(row.published).toRelative()}
        </time>
      ) : (
        '-'
      ),
  },
];

/**
 * Card for the catalog (entity page) that shows the latest tags
 * with their version number and the release date.
 *
 * @public
 */
export const EntityNpmReleaseOverviewCard = () => {
  const { entity } = useEntity();
  const { packageInfo, loading, error } = usePackageInfo();

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

  const data: TagRow[] = [];
  if (packageInfo?.['dist-tags']) {
    for (const [tag, version] of Object.entries(packageInfo['dist-tags'])) {
      if (showTags && showTags.length > 0 && !showTags.includes(tag)) {
        continue;
      }
      const published = packageInfo.time?.[version];
      data.push({ tag, version, published });
    }
  }

  const emptyContent = error ? (
    <Box padding={1}>
      <ErrorPanel error={error} />
    </Box>
  ) : null;

  return (
    <Table
      title="Current Tags"
      options={{ paging: false, padding: 'dense' }}
      isLoading={loading}
      data={data}
      columns={tagColumns}
      emptyContent={emptyContent}
    />
  );
};
