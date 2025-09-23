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
import { useEffect, useState } from 'react';

import {
  AppIcon,
  ErrorPanel,
  Link,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import Launch from '@mui/icons-material/Launch';
import { DateTime } from 'luxon';
import useDebounce from 'react-use/lib/useDebounce';

import { reportPortalApiRef } from '../../../api';

import {
  LaunchDetailsResponse,
  PageType,
} from '@backstage-community/plugin-report-portal-common';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useAsync from 'react-use/lib/useAsync';

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
      style={{ fontSize: '15px', minWidth: '150px' }}
    >
      {showTime ? dateTime : relativeTime}
    </Grid>
  );
};

function parseTime(value: string | number | undefined): number {
  if (!value) return 0;
  if (typeof value === 'number') {
    return value;
  }
  // assume ISO string
  return DateTime.fromISO(value).toMillis();
}

const CatalogLink = (props: { projectName: string; launchName: string }) => {
  const { projectName, launchName } = props;
  const catalogApi = useApi(catalogApiRef);
  const entityRoute = useRouteRef(entityRouteRef);

  const { value, loading } = useAsync(async () => {
    return await catalogApi.queryEntities({
      filter: [
        {
          kind: 'component',
          'metadata.annotations.reportportal.io/project-name': projectName,
          'metadata.annotations.reportportal.io/launch-name': launchName,
        },
      ],
    });
  }, [catalogApi]);

  if (loading) return null;

  if (!value) return null;
  const entity = value.items.at(0);

  return entity ? (
    <IconButton
      href={entityRoute({
        kind: entity.kind,
        name: entity.metadata.name,
        namespace: entity.metadata.namespace ?? 'default',
      })}
      size="medium"
      centerRipple
    >
      <AppIcon id="catalog" />
    </IconButton>
  ) : null;
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
        startTime: parseTime(data.startTime),
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
      width: '45%',
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
      align: 'right',
      sorting: false,
      width: '10%',
      render: row => (
        <div>
          <CatalogLink projectName={project} launchName={row.launchName} />
          <IconButton
            target="_blank"
            href={`https://${host}/ui/#${project}/launches/latest/${row.id}`}
            size="medium"
            centerRipple
          >
            <Launch />
          </IconButton>
        </div>
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
      style={{
        overflowX: 'auto',
        whiteSpace: 'nowrap',
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
