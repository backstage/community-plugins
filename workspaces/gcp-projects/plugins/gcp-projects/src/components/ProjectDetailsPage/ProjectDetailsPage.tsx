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
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useAsync, useMountEffect } from '@react-hookz/web';
import { gcpApiRef } from '../../api';

import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
  WarningPanel,
} from '@backstage/core-components';

import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { rootRouteRef } from '../../routes';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 720,
    margin: theme.spacing(2),
  },
  title: {
    padding: theme.spacing(1, 0, 2, 0),
  },
  table: {
    padding: theme.spacing(1),
  },
}));

const DetailsPage = () => {
  const api = useApi(gcpApiRef);
  const classes = useStyles();

  const [{ status, result: details, error }, { execute }] = useAsync(async () =>
    api.getProject(
      decodeURIComponent(window.location.search.split('projectId=')[1]),
    ),
  );

  useMountEffect(execute);

  if (status === 'loading') {
    return <LinearProgress />;
  } else if (error) {
    return (
      <WarningPanel title="Failed to load project">
        {error.toString()}
      </WarningPanel>
    );
  }

  const cloud_home_url = 'https://console.cloud.google.com';

  return (
    <Table component={Paper} className={classes.table}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography noWrap>Name</Typography>
            </TableCell>
            <TableCell>{details?.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography noWrap>Project Number</Typography>
            </TableCell>
            <TableCell>{details?.projectNumber}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography noWrap>Project ID</Typography>
            </TableCell>
            <TableCell>{details?.projectId}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography noWrap>State</Typography>
            </TableCell>
            <TableCell>{details?.lifecycleState}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography noWrap>Creation Time</Typography>
            </TableCell>
            <TableCell>{details?.createTime}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography noWrap>Links</Typography>
            </TableCell>
            <TableCell>
              <ButtonGroup
                variant="text"
                color="primary"
                aria-label="text primary button group"
              >
                {details?.name && (
                  <Button>
                    <a
                      href={`${cloud_home_url}/home/dashboard?project=${details.projectId}&supportedpurview=project`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      GCP
                    </a>
                  </Button>
                )}
                {details?.name && (
                  <Button>
                    <a
                      href={`${cloud_home_url}/logs/query?project=${details.projectId}&supportedpurview=project`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Logs
                    </a>
                  </Button>
                )}
              </ButtonGroup>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Table>
  );
};

const labels = (
  <>
    <HeaderLabel label="Owner" value="Spotify" />
    <HeaderLabel label="Lifecycle" value="Production" />
  </>
);

export const ProjectDetailsPage = () => {
  const docsRootLink = useRouteRef(rootRouteRef)();

  return (
    <Page themeId="service">
      <Header title="GCP Project Details" type="GCP" typeLink={docsRootLink}>
        {labels}
      </Header>
      <Content>
        <ContentHeader title="">
          <SupportButton>Support Button</SupportButton>
        </ContentHeader>
        <DetailsPage />
      </Content>
    </Page>
  );
};
