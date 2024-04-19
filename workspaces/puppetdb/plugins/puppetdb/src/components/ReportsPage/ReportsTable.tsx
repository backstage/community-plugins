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
import { puppetDbApiRef, PuppetDbReport } from '../../api';
import useAsync from 'react-use/esm/useAsync';
import React from 'react';
import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { puppetDbReportRouteRef } from '../../routes';
import { StatusField } from '../StatusField';

type ReportsTableProps = {
  certName: string;
};

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

/**
 * Component for displaying a table of PuppetDB reports for a given node.
 *
 * @public
 */
export const ReportsTable = (props: ReportsTableProps) => {
  const { certName } = props;
  const puppetDbApi = useApi(puppetDbApiRef);
  const reportsRouteLink = useRouteRef(puppetDbReportRouteRef);
  const classes = useStyles();

  const { value, loading, error } = useAsync(async () => {
    return puppetDbApi.getPuppetDbNodeReports(certName);
  }, [puppetDbApi, certName]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const columns: TableColumn<PuppetDbReport>[] = [
    {
      title: 'Configuration Version',
      field: 'configuration_version',
      render: rowData => (
        <Link
          component={RouterLink}
          to={reportsRouteLink({ hash: rowData.hash! })}
        >
          {rowData.configuration_version !== '' ? (
            <Typography noWrap>{rowData.configuration_version}</Typography>
          ) : (
            <Typography noWrap>
              <em>(N/A)</em>
            </Typography>
          )}
        </Link>
      ),
    },
    {
      title: 'Start Time',
      field: 'start_time',
      align: 'center',
      width: '300px',
      render: rowData => (
        <Typography noWrap>
          {new Date(Date.parse(rowData.start_time)).toLocaleString()}
        </Typography>
      ),
    },
    {
      title: 'End Time',
      field: 'end_time',
      align: 'center',
      width: '300px',
      render: rowData => (
        <Typography noWrap>
          {new Date(Date.parse(rowData.end_time)).toLocaleString()}
        </Typography>
      ),
    },
    {
      title: 'Run Duration',
      align: 'center',
      width: '400px',
      render: rowData => {
        const start_date = new Date(Date.parse(rowData.start_time));
        const end_date = new Date(Date.parse(rowData.end_time));
        const duration = new Date(end_date.getTime() - start_date.getTime());
        return (
          <Typography noWrap>
            {duration.getUTCHours().toString().padStart(2, '0')}:
            {duration.getUTCMinutes().toString().padStart(2, '0')}:
            {duration.getUTCSeconds().toString().padStart(2, '0')}.
            {duration.getUTCMilliseconds().toString().padStart(4, '0')}
          </Typography>
        );
      },
    },
    {
      title: 'Environment',
      field: 'environment',
    },
    {
      title: 'Mode',
      field: 'noop',
      align: 'center',
      render: rowData =>
        rowData.noop ? (
          <Typography>NOOP</Typography>
        ) : (
          <Typography>NO-NOOP</Typography>
        ),
    },
    {
      title: 'Status',
      field: 'status',
      align: 'center',
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
        <Typography color="textSecondary" className={classes.empty}>
          No reports
        </Typography>
      }
      title={`Latest PuppetDB reports from node ${certName}`}
      columns={columns}
      data={value || []}
      isLoading={loading}
    />
  );
};
