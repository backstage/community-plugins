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
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ExternalLinkIcon from '@material-ui/icons/Launch';
import React from 'react';
import { buildRouteRef } from '../../plugin';
import { JenkinsRunStatus } from '../BuildsPage/lib/Status';
import { useBuildWithSteps } from '../useBuildWithSteps';

import { Breadcrumbs, Content, Link } from '@backstage/core-components';
import { useRouteRefParams } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 720,
  },
  table: {
    padding: theme.spacing(1),
  },
  externalLinkIcon: {
    fontSize: 'inherit',
    verticalAlign: 'bottom',
  },
}));

const BuildWithStepsView = () => {
  // TODO: Add a test that react-router decodes this (even though `generatePath` doesn't encode it for you!)
  const { jobFullName, buildNumber } = useRouteRefParams(buildRouteRef);
  const classes = useStyles();

  const [{ value }] = useBuildWithSteps({ jobFullName, buildNumber });

  return (
    <div className={classes.root}>
      <Breadcrumbs aria-label="breadcrumb">
        {/* TODO: don't hardcode this link */}
        <Link to="../../..">Projects</Link>
        <Typography>Run</Typography>
      </Breadcrumbs>
      <Box m={2} />
      <TableContainer component={Paper} className={classes.table}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography noWrap>Branch</Typography>
              </TableCell>
              <TableCell>{value?.source?.branchName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Message</Typography>
              </TableCell>
              <TableCell>{value?.source?.displayName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Commit ID</Typography>
              </TableCell>
              <TableCell>{value?.source?.commit?.hash}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Status</Typography>
              </TableCell>
              <TableCell>
                <JenkinsRunStatus status={value?.status} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Author</Typography>
              </TableCell>
              <TableCell>{value?.source?.author}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Jenkins</Typography>
              </TableCell>
              <TableCell>
                {value?.url && (
                  <Link to={value.url}>
                    View on Jenkins{' '}
                    <ExternalLinkIcon className={classes.externalLinkIcon} />
                  </Link>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {/* TODO: be SCM agnostic */}
                <Typography noWrap>GitHub</Typography>
              </TableCell>
              <TableCell>
                {value?.source?.url && (
                  <Link to={value.source.url}>
                    View on GitHub{' '}
                    <ExternalLinkIcon className={classes.externalLinkIcon} />
                  </Link>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
const Page = () => (
  <Content>
    <BuildWithStepsView />
  </Content>
);

export default Page;
export { BuildWithStepsView as BuildWithSteps };
