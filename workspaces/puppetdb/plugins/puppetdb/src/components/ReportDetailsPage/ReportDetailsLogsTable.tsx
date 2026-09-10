/*
 * Copyright 2022 The Backstage Authors
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

import { puppetDbApiRef, PuppetDbReportLog } from '../../api';
import {
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import useAsync from 'react-use/esm/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { Text } from '@backstage/ui';
import styles from './ReportDetailsLogsTable.module.css';

type ReportLogsTableProps = {
  hash: string;
};

const levelColor = (level: string) => {
  switch (level) {
    case 'error':
      return 'danger' as const;
    case 'warning':
      return 'warning' as const;
    default:
      return 'info' as const;
  }
};

/**
 * Component for displaying PuppetDB report logs.
 *
 * @public
 */
export const ReportDetailsLogsTable = (props: ReportLogsTableProps) => {
  const { hash } = props;
  const puppetDbApi = useApi(puppetDbApiRef);
  const { value, loading, error } = useAsync(async () => {
    return puppetDbApi.getPuppetDbReportLogs(hash);
  }, [puppetDbApi, hash]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const columns: TableColumn<PuppetDbReportLog>[] = [
    {
      title: 'Level',
      field: 'level',
      align: 'center',
      width: '100px',
      render: rowData => (
        <Text truncate color={levelColor(rowData.level)}>
          {rowData.level.toLocaleUpperCase('en-US')}
        </Text>
      ),
    },
    {
      title: 'Timestamp',
      field: 'time',
      align: 'center',
      width: '300px',
      render: rowData => (
        <Text truncate>
          {new Date(Date.parse(rowData.time)).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Source',
      field: 'source',
      render: rowData => <Text truncate>{rowData.source}</Text>,
    },
    {
      title: 'Message',
      field: 'message',
      render: rowData => <Text truncate>{rowData.message}</Text>,
    },
  ];

  return (
    <Table
      options={{
        sorting: true,
        actionsColumnIndex: -1,
        loadingType: 'linear',
        padding: 'dense',
        showEmptyDataSourceMessage: !loading,
        showTitle: true,
        toolbar: true,
        pageSize: 10,
        pageSizeOptions: [10],
      }}
      emptyContent={
        <Text color="secondary" className={styles.empty}>
          No logs
        </Text>
      }
      title="Latest logs"
      columns={columns}
      data={value || []}
      isLoading={loading}
    />
  );
};
