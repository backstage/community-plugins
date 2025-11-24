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
import { jfrogArtifactoryTranslationRef } from '../../translations';

import makeStyles from '@material-ui/core/styles/makeStyles';

export const getColumns = (
  t: TranslationFunction<typeof jfrogArtifactoryTranslationRef.T>,
): TableColumn[] => [
  {
    title: t('table.columns.version'),
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: t('table.columns.repositories'),
    field: 'repositories',
    type: 'string',
  },
  {
    title: t('table.columns.manifest'),
    field: 'manifest_digest',
    type: 'string',
  },
  {
    title: t('table.columns.modified'),
    field: 'last_modified',
    type: 'date',
  },
  {
    title: t('table.columns.size'),
    field: 'size',
    type: 'string',
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
