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
import useDebounce from 'react-use/lib/useDebounce';

import {
  ErrorPanel,
  Link,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  alertApiRef,
  configApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';

import Launch from '@mui/icons-material/Launch';
import Skeleton from '@mui/material/Skeleton';

import { useNavigate } from 'react-router-dom';
import {
  ProjectDetails,
  ProjectListResponse,
  reportPortalApiRef,
} from '../../../api';
import { launchRouteRef } from '../../../routes';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const UniqueLaunches = (props: { host: string; projectId: string }) => {
  const { host, projectId } = props;
  const [loading, setLoading] = useState(true);
  const [noOfLaunches, setNoOfLaunches] = useState<string | number>('-');
  const alertApi = useApi(alertApiRef);

  const api = useApi(reportPortalApiRef);
  useEffect(() => {
    api
      .getLaunchResults(projectId, host, {})
      .then(res => {
        setNoOfLaunches(res.content.length);
        setLoading(false);
      })
      .catch(err => {
        alertApi.post({
          message: err,
          display: 'transient',
          severity: 'error',
        });
        setLoading(false);
      });
  }, [api, projectId, host, alertApi]);
  return loading ? <Skeleton height="2rem" /> : <>{noOfLaunches}</>;
};

export const ProjectsPageContent = (props: { host: string }) => {
  const { host } = props;
  const launchPageRoute = useRouteRef(launchRouteRef);

  const config = useApi(configApiRef).getConfigArray(
    'reportPortal.integrations',
  );
  const filterType =
    config
      .find(value => value.getString('host') === host)
      ?.getString('filterType') ?? 'INTERNAL';

  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<ProjectListResponse>({
    content: [],
    page: {
      number: 1,
      size: 10,
      totalElements: 0,
      totalPages: 1,
    },
  });
  const reportPortalApi = useApi(reportPortalApiRef);

  const [error, setError] = useState<any>();

  const defaultFilters = {
    'filter.eq.type': filterType,
    'page.size': tableData.page.size,
    'page.page': tableData.page.number,
  };

  const [filters, setFilters] = useState<{ [key: string]: any }>(
    defaultFilters,
  );

  useEffect(() => {
    if (loading) {
      reportPortalApi
        .getInstanceDetails(host, filters)
        .then(res => {
          setTableData({ ...res });
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          setError(err);
        });
    }
  }, [reportPortalApi, filterType, filters, host, loading]);

  const columns: TableColumn<ProjectDetails>[] = [
    {
      id: 0,
      title: 'Name',
      field: 'projectName',
      render: row => (
        <Link
          to={`${launchPageRoute()}?host=${host}&project=${row.projectName}`}
        >
          {row.projectName}
        </Link>
      ),
      width: '40%',
      searchable: true,
    },
    {
      id: 1,
      sorting: false,
      width: '20%',
    },
    {
      id: 2,
      title: 'Launches',
      align: 'center',
      width: '10%',
      highlight: true,
      render: row => <UniqueLaunches host={host} projectId={row.projectName} />,
    },
    {
      id: 3,
      sorting: false,

      width: '25%',
    },
    {
      id: 4,
      title: 'Actions',
      sorting: false,
      align: 'center',
      width: '5%',
      render: row => (
        <Tooltip title="View on report portal" disableInteractive>
          <IconButton
            style={{ padding: 0 }}
            href={`https://${host}/ui/#${row.projectName}`}
            target="_blank"
            size="medium"
            onClick={e => e.stopPropagation()}
            centerRipple
            color="inherit"
          >
            <Launch />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  function handlePageChange(page: number, pageSize: number) {
    setFilters({
      ...defaultFilters,
      'page.page': page + 1,
      'page.size': pageSize,
    });
    setLoading(true);
  }

  const [searchText, setSearchText] = useState<string>();
  useDebounce(
    () => {
      setFilters({
        ...defaultFilters,
        ...(searchText && { 'predefinedFilter.projects': searchText }),
      });
      setLoading(true);
    },
    600,
    [searchText],
  );

  function handleSearchInput(inputText: string) {
    setSearchText(inputText.length > 0 ? inputText : undefined);
  }

  const navigate = useNavigate();
  if (error) return <ErrorPanel error={error} />;

  return (
    <Table
      options={{
        padding: 'dense',
        pageSize: tableData.page.size,
        paginationPosition: 'both',
        searchFieldVariant: 'outlined',
      }}
      title={`Projects (${tableData.page.totalElements})`}
      columns={columns}
      data={tableData.content}
      page={tableData.page.number - 1}
      totalCount={tableData.page.totalElements}
      onSearchChange={handleSearchInput}
      onRowClick={(_e, r) =>
        navigate(`${launchPageRoute()}?host=${host}&project=${r?.projectName}`)
      }
      onPageChange={handlePageChange}
      isLoading={loading}
    />
  );
};
