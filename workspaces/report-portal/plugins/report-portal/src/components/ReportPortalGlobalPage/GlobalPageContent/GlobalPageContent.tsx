import React, { useEffect, useState } from 'react';

import { Link, Table, TableColumn } from '@backstage/core-components';
import { configApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';

import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';

import { reportPortalApiRef } from '../../../api';
import { useInstanceDetails } from '../../../hooks';
import { projectsRouteRef } from '../../../routes';

type InstanceData = {
  instance: string;
  filterType: string;
  projects: React.ReactNode;
};

const NoOfProjects = (props: { host: string; filter: string }) => {
  const { loading, projectListData } = useInstanceDetails(
    props.host,
    props.filter,
  );
  return loading ? (
    <Skeleton height="3rem" width="2rem" />
  ) : (
    <b>{projectListData?.content.length}</b>
  );
};

export const GlobalPageContent = () => {
  const config = useApi(configApiRef);
  const reportPortalApi = useApi(reportPortalApiRef);
  const hostsConfig = config.getConfigArray('reportPortal.integrations');
  const [hosts, _] = useState<
    { host: string; filterType: string }[] | undefined
  >(
    hostsConfig.map(value => ({
      host: value.getString('host'),
      filterType: value.getString('filterType') ?? 'INTERNAL',
    })),
  );

  const projectsPageRoute = useRouteRef(projectsRouteRef)();

  const [instanceData, setInstanceData] = useState<InstanceData[]>([]);
  const columns: TableColumn<InstanceData>[] = [
    {
      id: 0,
      field: 'instance',
      title: 'Instances',
      render: rowData => (
        <Link to={projectsPageRoute.concat(`?host=${rowData.instance}`)}>
          {rowData.instance}
        </Link>
      ),
      width: '60%',
    },
    {
      id: 1,
      field: 'projects',
      title: 'Projects',
      align: 'left',
      render: rowData => rowData.projects,
      width: '10%',
    },
    {
      id: 2,
      field: 'portalLink',
      title: 'Actions',
      align: 'center',
      render: rowData => (
        <IconButton
          href={reportPortalApi.getReportPortalBaseUrl(rowData.instance)}
          rel="noreferrer noopener"
          target="_blank"
          size="large"
        >
          <LaunchIcon />
        </IconButton>
      ),
      width: '30%',
    },
  ];

  useEffect(() => {
    if (hosts) {
      const tempArr: InstanceData[] = [];
      hosts.forEach(value => {
        tempArr.push({
          instance: value.host,
          filterType: value.filterType,
          projects: (
            <NoOfProjects host={value.host} filter={value.filterType} />
          ),
        });
      });
      setInstanceData(tempArr);
    }
  }, [hosts]);

  return (
    <Table
      title="Instances"
      columns={columns}
      options={{ padding: 'dense', searchFieldVariant: 'outlined' }}
      data={instanceData}
    />
  );
};
