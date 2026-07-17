/*
 * Copyright 2021 The Backstage Authors
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
import { Build } from '../api';
import { formatTime, formatDuration } from '../utils';
import { StatusIcon } from './StatusIcon';
import styles from './BuildTableColumns.module.css';

const baseColumns: TableColumn<Build>[] = [
  {
    field: 'buildStatus',
    render: data => <StatusIcon buildStatus={data.buildStatus} />,
  },
  {
    title: 'Project',
    field: 'projectName',
  },
  {
    title: 'Schema',
    field: 'schema',
  },
  {
    title: 'Started',
    field: 'startedAt',
    render: data => formatTime(data.startTimestamp),
    cellStyle: { whiteSpace: 'nowrap' },
  },
  {
    title: 'Duration',
    field: 'duration',
    render: data => formatDuration(data.duration),
  },
  {
    title: 'User',
    field: 'userid',
  },
];

const isCi: TableColumn<Build> = {
  field: 'isCI',
  render: data => data.isCi && <span className={styles.badge}>CI</span>,
  sorting: false,
};

export const overviewColumns: TableColumn<Build>[] = [...baseColumns, isCi];

export const buildPageColumns: TableColumn<Build>[] = [
  ...baseColumns,
  {
    title: 'Host',
    field: 'machineName',
  },
  {
    title: 'Warnings',
    field: 'warningCount',
  },
  {
    title: 'Category',
    field: 'category',
    render: data =>
      data.category ? (
        <span className={styles.badge}>{data.category}</span>
      ) : null,
  },
  isCi,
];
