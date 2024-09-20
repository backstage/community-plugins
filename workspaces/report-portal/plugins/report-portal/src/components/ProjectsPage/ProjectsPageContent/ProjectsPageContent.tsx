import React, { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import {
  ErrorPanel,
  Link,
  Table,
  TableColumn,
  LinkButton,
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
      title: 'Project',
      field: 'projectName',
      render: row => (
        <Link
          to={`${launchPageRoute()}?host=${host}&project=${row.projectName}`}
        >
          {row.projectName}
        </Link>
      ),
      width: '60%',
      searchable: true,
    },
    {
      id: 1,
      title: 'Launches',
      width: '30%',
      render: row => <UniqueLaunches host={host} projectId={row.projectName} />,
    },
    {
      id: 2,
      title: 'Actions',
      align: 'center',
      render: row => (
        <LinkButton
          to={`https://${host}/ui/#${row.projectName}/`}
          size="large"
          color="inherit"
        >
          <Launch />
        </LinkButton>
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
