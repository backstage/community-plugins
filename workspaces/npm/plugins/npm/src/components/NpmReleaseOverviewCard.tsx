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
import { Table, type TableColumn } from '@backstage/core-components';
import { DateTime } from 'luxon';
import { NPM_PACKAGE_ANNOTATION } from '../annotations';
import useAsync from 'react-use/esm/useAsync';
import { API } from '../api';

interface TagRow {
  tag: string;
  version: string;
  published: string;
}

/**
 * Card for the catalog (entiy page) that shows the latest tags
 * with their version number and the release date.
 *
 * @public
 */
export function NpmReleaseOverviewCard() {
  const { entity } = useEntity();

  const packageName = entity.metadata.annotations?.[NPM_PACKAGE_ANNOTATION];

  const packageInfo = useAsync(
    () => API.fetchNpmPackage(packageName),
    [packageName],
  );

  if (!packageName) {
    return (
      <MissingAnnotationEmptyState
        annotation={NPM_PACKAGE_ANNOTATION}
        readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format"
      />
    );
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
      render: row => (
        <time dateTime={row.published} title={row.published}>
          {DateTime.fromISO(row.published).toRelative()}
        </time>
      ),
    },
  ];

  const tagData: TagRow[] = [];
  if (packageInfo.value?.['dist-tags']) {
    for (const [tag, version] of Object.entries(
      packageInfo.value['dist-tags'],
    )) {
      const published = packageInfo.value.time[version];
      tagData.push({ tag, version, published });
    }
  }

  return (
    <Table
      title="Current Tags"
      options={{ paging: false, padding: 'dense' }}
      isLoading={packageInfo.loading}
      data={tagData}
      columns={tagColumns}
    />
  );
}
