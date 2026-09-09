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
import { puppetDbApiRef, PuppetDbReportEvent } from '../../api';
import {
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import useAsync from 'react-use/esm/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { Text } from '@backstage/ui';
import { StatusField } from '../StatusField';
import styles from './ReportDetailsEventsTable.module.css';

type ReportEventsTableProps = {
  hash: string;
};

/**
 * Component for displaying PuppetDB report events.
 *
 * @public
 */
export const ReportDetailsEventsTable = (props: ReportEventsTableProps) => {
  const { hash } = props;
  const puppetDbApi = useApi(puppetDbApiRef);
  const { value, loading, error } = useAsync(async () => {
    return puppetDbApi.getPuppetDbReportEvents(hash);
  }, [puppetDbApi, hash]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const columns: TableColumn<PuppetDbReportEvent>[] = [
    {
      title: 'Run Start Time',
      field: 'run_start_time',
      align: 'center',
      width: '300px',
      render: rowData => (
        <Text truncate>
          {new Date(Date.parse(rowData.run_start_time)).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Run End Time',
      field: 'run_end_time',
      align: 'center',
      width: '300px',
      render: rowData => (
        <Text truncate>
          {new Date(Date.parse(rowData.run_end_time)).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Containing Class',
      field: 'containing_class',
      render: rowData => (
        <Text truncate title={rowData.file || ''}>
          {rowData.containing_class}
        </Text>
      ),
    },
    {
      title: 'Resource',
      field: 'resource_title',
      render: rowData => (
        <Text truncate>
          {rowData.resource_type}[{rowData.resource_title}]
        </Text>
      ),
    },
    {
      title: 'Property',
      field: 'property',
      render: rowData => <Text truncate>{rowData.property}</Text>,
    },
    {
      title: 'Old Value',
      field: 'old_value',
      render: rowData => <Text truncate>{rowData.old_value}</Text>,
    },
    {
      title: 'New Value',
      field: 'new_value',
      render: rowData => <Text truncate>{rowData.new_value}</Text>,
    },
    {
      title: 'Status',
      field: 'status',
      render: rowData => <StatusField status={rowData.status} />,
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
          No events
        </Text>
      }
      title="Latest events"
      columns={columns}
      data={value || []}
      isLoading={loading}
    />
  );
};
