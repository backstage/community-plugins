import React, { useEffect, useState } from 'react';

import {
  ErrorPanel,
  Link,
  Table,
  TableColumn,
  LinkButton,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';

import Launch from '@mui/icons-material/Launch';
import Skeleton from '@mui/material/Skeleton';

import {
  ProjectDetails,
  ProjectListResponse,
  reportPortalApiRef,
} from '../../../api';
import { launchRouteRef } from '../../../routes';

const UniqueLaunches = (props: { host: string; projectId: string }) => {
  const { host, projectId } = props;
  const [loading, setLoading] = useState(true);
  const [noOfLaunches, setNoOfLaunches] = useState(0);

  const api = useApi(reportPortalApiRef);
  useEffect(() => {
    api.getLaunchResults(projectId, host, {}).then(res => {
      setNoOfLaunches(res.content.length);
      setLoading(false);
    });
  }, [api, projectId, host]);

  return loading ? (
    <Skeleton width="2rem" height="3rem" />
  ) : (
    <b>{noOfLaunches}</b>
  );
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

  useEffect(() => {
    if (loading) {
      reportPortalApi
        .getInstanceDetails(host, {
          'filter.eq.type': filterType,
          'page.size': tableData.page.size,
          'page.page': tableData.page.number,
        })
        .then(res => {
          setTableData({ ...res });
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          setError(err);
        });
    }
  });

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
    setLoading(true);
    reportPortalApi
      .getInstanceDetails(host, {
        'filter.eq.type': filterType,
        'page.size': pageSize,
        'page.page': page + 1,
      })
      .then(res => {
        setTableData({ ...res });
        setLoading(false);
      });
  }

  if (error) return <ErrorPanel error={error} />;

  return (
    <Table
      options={{
        padding: 'dense',
        pageSize: tableData.page.size,
        paginationPosition: 'both',
        searchFieldVariant: 'outlined',
      }}
      title="Projects"
      columns={columns}
      data={tableData.content}
      page={tableData.page.number - 1}
      totalCount={tableData.page.totalElements}
      onPageChange={handlePageChange}
      isLoading={loading}
    />
  );
};
