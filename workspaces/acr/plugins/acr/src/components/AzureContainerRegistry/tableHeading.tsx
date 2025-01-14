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
import * as React from 'react';

import { TableColumn } from '@backstage/core-components';

import makeStyles from '@material-ui/core/styles/makeStyles';

import { TagRow } from '../../types';
import { ManifestDigestChip } from './ManifestDigestChip';

export const columns: TableColumn[] = [
  {
    title: 'Tag',
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Created',
    field: 'createdTime',
    type: 'date',
  },
  {
    title: 'Last Modified',
    field: 'lastModified',
    type: 'date',
  },
  {
    title: 'Manifest',
    field: 'manifestDigest',
    type: 'string',
    render: (row): React.ReactNode => {
      const hashFunc = (row as TagRow)?.manifestDigest?.substring(0, 6);
      const shortHash = (row as TagRow)?.manifestDigest?.substring(7, 19);
      return <ManifestDigestChip label={hashFunc} hash={shortHash} />;
    },
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));