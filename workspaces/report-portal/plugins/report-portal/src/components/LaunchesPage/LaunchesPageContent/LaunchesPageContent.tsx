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
import React, { useEffect, useState } from 'react';

import {
  ErrorPanel,
  Table,
  TableColumn,
  Link,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import Launch from '@mui/icons-material/Launch';
import { DateTime } from 'luxon';
import useDebounce from 'react-use/lib/useDebounce';

import { reportPortalApiRef } from '../../../api';

import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  PageType,
  LaunchDetailsResponse,
} from '@backstage-community/plugin-report-portal-common';

type LaunchDetails = {
  id: number;
  launchName: string;
  number: number;
  status: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  startTime: number;
};

const RenderTime = (props: { timeMillis: number }) => {
  const relativeTime = DateTime.fromMillis(props.timeMillis)
    .toLocal()
    .toRelative();
  const dateTime = DateTime.fromMillis(props.timeMillis).toLocaleString({
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  const [showTime, setShowTime] = useState(false);
  return (
    <Grid
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
      style={{ fontSize: '15px' }}
    >
      {showTime ? dateTime : relativeTime}
    </Grid>
  );
};

export const LaunchesPageContent = (props: {
  host: string;
  project: string;
}) => {
  const { host, project } = props;
  const reportPortalApi = useApi(reportPortalApiRef);

  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<{
    launches: LaunchDetails[];
    page: PageType;
  }>({
    launches: [],
    page: {
      number: 1,
      size: 50,
      totalElements: 0,
      totalPages: 1,
    },
  });

  const [error, setError] = useState<any>();
  const defaultFilters = {
    'page.size': tableData.page.size,
    'page.page': tableData.page.number,
    'page.sort': 'startTime,DESC',
  };

  const [filters, setFilters] = useState<{ [key: string]: any }>(
    defaultFilters,
  );
  useEffect(() => {
    setLoading(true);
    reportPortalApi
      .getLaunchResults(project, host, filters)
      .then(res => {
        responseHandler(res);
      })
      .catch(err => {
        setLoading(false);
        setError(err);
      });
  }, [host, project, reportPortalApi, filters]);

  function handlePageChange(page: number, pageSize: number) {
    setFilters({
      'page.size': pageSize,
      'page.page': page + 1,
    });
    setLoading(true);
  }

  function responseHandler(res: LaunchDetailsResponse) {
    const tempArr: LaunchDetails[] = [];
    res.content.forEach(data => {
      tempArr.push({
        id: data.id,
        launchName: data.name,
        number: data.number,
        status: data.status,
        total: data.statistics.executions.total ?? 0,
        passed: data.statistics.executions.passed ?? 0,
        failed: data.statistics.executions.failed ?? 0,
        skipped: data.statistics.executions.skipped ?? 0,
        startTime: data.startTime,
      });
    });
    setTableData({ launches: tempArr, page: res.page });
    setLoading(false);
  }

  const columns: TableColumn<LaunchDetails>[] = [
    {
      id: 0,
      field: 'launchName',
      title: 'Launch Name',
      render: row => (
        <>
          <Link to={`https://${host}/ui/#${project}/launches/latest/${row.id}`}>
            {row.launchName} #{row.number}
          </Link>
          {row.total === 0 && ` - (${row.status})`}
        </>
      ),
      width: '50%',
    },
    {
      id: 1,
      title: 'Total',
      align: 'center',
      width: '5%',
      field: 'total',
      render: data =>
        data.total === 0 ? (
          <Typography variant="caption">-</Typography>
        ) : (
          data.total
        ),
      highlight: true,
    },
    {
      id: 2,
      title: 'Passed',
      align: 'center',
      width: '5%',
      field: 'passed',
      render: data =>
        data.passed === 0 ? (
          <Typography variant="caption">-</Typography>
        ) : (
          <Typography variant="button" color="green">
            {data.passed}
          </Typography>
        ),
      highlight: true,
    },
    {
      id: 3,
      title: 'Failed',
      align: 'center',
      width: '5%',
      field: 'failed',
      render: data =>
        data.failed === 0 ? (
          <Typography variant="caption">-</Typography>
        ) : (
          <Typography variant="button" color="#a60000">
            {data.failed}
          </Typography>
        ),
      highlight: true,
    },
    {
      id: 4,
      title: 'Skipped',
      align: 'center',
      width: '5%',
      field: 'skipped',
      render: data =>
        data.skipped === 0 ? (
          <Typography variant="caption">-</Typography>
        ) : (
          <Typography variant="button" color="grey">
            {data.skipped}
          </Typography>
        ),
      highlight: true,
    },
    {
      id: 4,
      title: 'Start Time',
      align: 'center',
      defaultSort: 'desc',
      field: 'startTime',
      width: '25%',
      cellStyle: () => ({ paddingTop: 0, paddingBottom: 0 }),
      render: row => <RenderTime timeMillis={row.startTime} />,
    },
    {
      id: 5,
      title: 'Actions',
      align: 'center',
      sorting: false,
      width: '5%',
      render: row => (
        <IconButton
          target="_blank"
          style={{ padding: 0 }}
          href={`https://${host}/ui/#${project}/launches/latest/${row.id}`}
          size="small"
          centerRipple
          color="inherit"
        >
          <Launch />
        </IconButton>
      ),
    },
  ];

  const [searchText, setSearchText] = useState<string>('');

  useDebounce(
    () => {
      setFilters({
        ...defaultFilters,
        ...(searchText?.length > 0 && { 'filter.cnt.name': searchText }),
      });
    },
    400,
    [searchText],
  );

  function handleInput(inputString: string) {
    setSearchText(inputString);
  }

  if (error) return <ErrorPanel error={error} />;
  return (
    <Table
      options={{
        pageSizeOptions: [25, 50, 100],
        sorting: true,
        pageSize: tableData.page.size,
        searchFieldVariant: 'outlined',
        padding: 'dense',
        paginationPosition: 'both',
        emptyRowsWhenPaging: false,
      }}
      title={`Latest Launches (${tableData.page.totalElements})`}
      columns={columns}
      data={tableData.launches ?? []}
      page={tableData.page.number - 1}
      totalCount={tableData.page.totalElements}
      onPageChange={handlePageChange}
      onSearchChange={handleInput}
      isLoading={loading}
    />
  );
};
