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
import type { FC } from 'react';

import { Fragment } from 'react';
import { ErrorBoundary } from '@backstage/core-components';
import { Box, Paper, Typography, makeStyles, Theme } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SecurityViewerTabbedMultiCISummaryList } from './SecurityViewerTabbedMultiCISummaryList';
import { MultiCIConfig } from '../../types/multiCI';
import { SecurityViewerJenkinsDetail } from './SecurityViewerJenkinsDetail';
import { SecurityViewerGithubActionsDetail } from './SecurityViewerGithubActionsDetail';
import { useMssvViewPermission } from '../../hooks/useMssvViewPermisson';
import PermissionAlert from '../PermissionAlert/PermissionAlert';
import { EmptyStateSpinner } from '../EmptyState/EmptyStateSpinner';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'start',
  },
  title: {
    margin: theme.spacing(0, 0, 2, 2),
    fontWeight: 700,
  },
  titleBox: {
    marginTop: theme.spacing(2),
  },
}));

type SecurityViewerMultiCIPipelinesProps = {
  multiCIConfig: MultiCIConfig[];
  isJenkinsDetail?: boolean;
  isGithubActionsDetail?: boolean;
};

export const SecurityViewerMultiCIPipelines: FC<
  SecurityViewerMultiCIPipelinesProps
> = ({ multiCIConfig, isJenkinsDetail, isGithubActionsDetail }) => {
  useDarkTheme();
  const classes = useStyles();
  const queryClient = new QueryClient();
  const isSummary = !isJenkinsDetail && !isGithubActionsDetail;
  const { allowed: hasViewPermission, loading: viewPermissionLoading } =
    useMssvViewPermission();

  if (!hasViewPermission) {
    return viewPermissionLoading ? <EmptyStateSpinner /> : <PermissionAlert />;
  }

  return (
    <Fragment>
      <Box className={classes.root}>
        <Paper>
          <Grid container>
            <Grid item xs={12}>
              <Box className={classes.titleBox}>
                <Typography
                  variant="h4"
                  component="h4"
                  className={classes.title}
                >
                  Security Information
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                  {isJenkinsDetail && <SecurityViewerJenkinsDetail />}
                  {isGithubActionsDetail && (
                    <SecurityViewerGithubActionsDetail />
                  )}
                  {isSummary && (
                    <SecurityViewerTabbedMultiCISummaryList
                      multiCIConfig={multiCIConfig}
                    />
                  )}
                </QueryClientProvider>
              </ErrorBoundary>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Fragment>
  );
};
