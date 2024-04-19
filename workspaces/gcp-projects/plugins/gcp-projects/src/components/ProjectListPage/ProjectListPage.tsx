/*
 * Copyright 2020 The Backstage Authors
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

//  NEEDS WORK
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import React from 'react';

import { useAsync, useMountEffect } from '@react-hookz/web';
import { gcpApiRef, Project } from '../../api';

import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Link,
  Page,
  Table,
  SupportButton,
  WarningPanel,
} from '@backstage/core-components';

import { useApi } from '@backstage/core-plugin-api';

import { Link as RouterLink } from 'react-router-dom';

const LongText = ({ text, max }: { text: string; max: number }) => {
  if (text.length < max) {
    return (
      <Typography color="primary" component="span">
        {text}
      </Typography>
    );
  }
  return (
    <Tooltip title={text}>
      <Typography color="primary" component="span">
        {text.slice(0, max)}...
      </Typography>
    </Tooltip>
  );
};

const labels = (
  <>
    <HeaderLabel label="Owner" value="Spotify" />
    <HeaderLabel label="Lifecycle" value="Production" />
  </>
);

const PageContents = () => {
  const api = useApi(gcpApiRef);

  const [{ status, result, error }, { execute }] = useAsync(() =>
    api.listProjects(),
  );
  useMountEffect(execute);

  if (status === 'loading') {
    return <LinearProgress />;
  } else if (error) {
    return (
      <WarningPanel title="Failed to load projects">
        {error.toString()}
      </WarningPanel>
    );
  }

  function renderLink(id: string) {
    return (
      <Link to={`project?projectId=${encodeURIComponent(id)}`}>
        <Typography color="primary">
          <LongText text={id} max={60} />
        </Typography>
      </Link>
    );
  }

  return (
    <div style={{ height: '95%', width: '100%' }}>
      <Table
        columns={[
          {
            field: 'name',
            title: 'Name',
            defaultSort: 'asc',
          },
          {
            field: 'projectNumber',
            title: 'Project Number',
          },
          {
            field: 'projectID',
            title: 'Project ID',
            render: (rowData: { id: string }) => renderLink(rowData.id),
          },
          {
            field: 'state',
            title: 'State',
          },
          {
            field: 'creationTime',
            title: 'Creation Time',
          },
        ]}
        data={
          result?.map((project: Project) => ({
            id: project.projectId,
            name: project.name,
            projectNumber: project?.projectNumber || 'Error',
            projectID: project.projectId,
            state: project?.lifecycleState || 'Error',
            creationTime: project?.createTime || 'Error',
          })) || []
        }
        options={{
          pageSize: 5,
          pageSizeOptions: [5, 10, 25, 50, 100],
        }}
      />
    </div>
  );
};

export const ProjectListPage = () => (
  <Page themeId="service">
    <Header title="GCP Projects" type="tool">
      {labels}
    </Header>
    <Content>
      <ContentHeader title="">
        <Button
          component={RouterLink}
          variant="contained"
          color="primary"
          to="new"
        >
          New Project
        </Button>
        <SupportButton>All your software catalog entities</SupportButton>
      </ContentHeader>
      <PageContents />
    </Content>
  </Page>
);
