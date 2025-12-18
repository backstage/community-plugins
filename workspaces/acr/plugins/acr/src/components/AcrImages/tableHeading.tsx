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
import { TableColumn } from '@backstage/core-components';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

import { TagRow } from '../../types';
import { acrTranslationRef } from '../../translations';
import { ManifestDigestChip } from './ManifestDigestChip';

export const getColumns = (
  t: TranslationFunction<typeof acrTranslationRef.T>,
): TableColumn<TagRow>[] => [
  {
    title: t('table.columns.tag'),
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: t('table.columns.created'),
    field: 'createdTime',
    type: 'date',
  },
  {
    title: t('table.columns.lastModified'),
    field: 'lastModified',
    type: 'date',
  },
  {
    title: t('table.columns.manifest'),
    field: 'manifestDigest',
    type: 'string',
    render: (row): React.ReactNode => {
      const hashFunc = row.manifestDigest?.substring(0, 6);
      const shortHash = row.manifestDigest?.substring(7, 19);
      return <ManifestDigestChip label={hashFunc} hash={shortHash} />;
    },
  },
];
