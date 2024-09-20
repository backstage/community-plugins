import React, { useEffect, useState } from 'react';

import {
  ErrorPanel,
  Table,
  TableColumn,
  Link,
  LinkButton,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import Launch from '@mui/icons-material/Launch';
import { DateTime } from 'luxon';
import { useDebounce } from 'react-use';

import {
  LaunchDetailsResponse,
  PageType,
  reportPortalApiRef,
} from '../../../api';

import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

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
        <Link to={`https://${host}/ui/#${project}/launches/latest/${row.id}`}>
          {row.launchName} #{row.number}
        </Link>
      ),
      width: '50%',
      searchable: true,
    },
    {
      id: 1,
      title: 'Total',
      align: 'center',
      width: '5%',
      render: row => <b>{row.total}</b>,
    },
    {
      id: 2,
      title: 'Passed',
      align: 'center',
      width: '5%',
      render: row => <b>{row.passed}</b>,
    },
    {
      id: 3,
      title: 'Failed',
      align: 'center',
      width: '5%',
      render: row => <b>{row.failed}</b>,
    },
    {
      id: 4,
      title: 'Skipped',
      align: 'center',
      width: '5%',
      render: row => <b>{row.skipped}</b>,
    },
    {
      id: 4,
      title: 'Start Time',
      align: 'center',
      defaultSort: 'desc',
      field: 'startTime',
      width: '25%',
      render: row => DateTime.fromMillis(row.startTime).toRelative(),
    },
    {
      id: 5,
      title: 'Actions',
      align: 'center',
      sorting: false,
      width: '5%',
      render: row => (
        <LinkButton
          to={`https://${host}/ui/#${project}/launches/latest/${row.id}`}
          size="large"
          centerRipple
          color="inherit"
        >
          <Launch />
        </LinkButton>
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
