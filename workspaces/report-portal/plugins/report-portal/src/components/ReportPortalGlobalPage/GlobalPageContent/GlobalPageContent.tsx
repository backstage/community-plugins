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

import { Link, Table, TableColumn } from '@backstage/core-components';
import { configApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';

import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';

import { reportPortalApiRef } from '../../../api';
import { useInstanceDetails } from '../../../hooks';
import { projectsRouteRef } from '../../../routes';
import { useNavigate } from 'react-router-dom';

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
    <Skeleton height="3rem" />
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
      title: 'Name',
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
      align: 'center',
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
          onClick={e => e.stopPropagation()}
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

  const navigate = useNavigate();

  return (
    <Table
      title="Instances"
      columns={columns}
      onRowClick={(_e, rowData) =>
        navigate(projectsPageRoute.concat(`?host=${rowData?.instance}`))
      }
      options={{
        searchFieldVariant: 'outlined',
        draggable: false,
        padding: 'dense',
      }}
      data={instanceData}
    />
  );
};
