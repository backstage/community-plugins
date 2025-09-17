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
import MultiProgress from 'react-multi-progress';

import { InfoCard, InfoCardVariants } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useLaunchDetails, useProjectDetails } from '../../hooks';
import { isReportPortalAvailable } from '../../utils/isReportPortalAvailable';

const HeaderComponent = (props: { total: number }) => {
  return (
    <Grid container justifyContent="space-between">
      <Grid item>Test Statistics</Grid>
      {props.total === -1 ? (
        <Grid item xs={2}>
          <Skeleton />
        </Grid>
      ) : (
        <Grid item>Total: {props.total}</Grid>
      )}
    </Grid>
  );
};

type Defect = { id: number; name: string; total: number; color: string };

const StyledTypography = styled(Typography, {
  shouldForwardProp: prop => prop !== 'color',
})(({ theme, color }) => ({
  '&::before': {
    width: '0.7em',
    height: '0.7em',
    display: 'inline-block',
    marginRight: theme.spacing(1),
    borderRadius: '50%',
    content: '""',
    backgroundColor: color,
  },
}));

const DefectStatus = (props: { color: string; children: any }) => {
  return (
    <StyledTypography
      color={props.color}
      aria-label="Status"
      aria-hidden="true"
    >
      {props.children}
    </StyledTypography>
  );
};

const StyledResults = styled(Typography)({
  '& > *': { fontWeight: '800' },
});

const ReportPortalStatisticsCard = (props: { variant: InfoCardVariants }) => {
  const config = useApi(configApiRef);
  const theme = useTheme();

  const hostsConfig = config.getConfigArray('reportPortal.integrations');

  const { entity } = useEntity();
  const projectId =
    entity.metadata.annotations?.['reportportal.io/project-name'] ?? '';
  const launchName =
    entity.metadata.annotations?.['reportportal.io/launch-name'] ?? '';
  const hostName =
    entity.metadata.annotations?.['reportportal.io/host'] ??
    hostsConfig[0].getString('host');

  const [defects, setDefects] = useState<Defect[]>([]);
  const [filters, _] = useState<{ [key: string]: string | number } | undefined>(
    {
      'filter.eq.name': launchName,
    },
  );

  const { loading, launchDetails } = useLaunchDetails(
    projectId,
    hostName,
    filters,
  );
  const { loading: projectLoading, projectDetails } = useProjectDetails(
    projectId,
    hostName,
  );

  useEffect(() => {
    if (!loading && launchDetails && projectDetails) {
      const tempArr: Defect[] = [];
      Object.keys(launchDetails.statistics.defects).forEach(defect => {
        tempArr.push({
          name: projectDetails.configuration.subTypes?.[
            defect.toLocaleUpperCase('en-US')
          ][0].longName,
          total: launchDetails.statistics.defects?.[defect].total,
          color:
            projectDetails.configuration.subTypes?.[
              defect.toLocaleUpperCase('en-US')
            ][0].color,
          id: projectDetails.configuration.subTypes?.[
            defect.toLocaleUpperCase('en-US')
          ][0].id,
        });
      });
      setDefects(tempArr);
    }
  }, [loading, launchDetails, projectDetails]);

  if (!isReportPortalAvailable(entity)) return null;

  return (
    <InfoCard
      title={
        <HeaderComponent
          total={launchDetails?.statistics.executions.total ?? -1}
        />
      }
      variant={props.variant}
      divider
      deepLink={{
        link: `https://${hostName}/ui/#${projectId}/launches/latest/${launchDetails?.id}`,
        title: 'View on Report Portal',
      }}
    >
      <Grid container spacing={3}>
        {loading ? (
          <>
            <Grid item xs={12}>
              <Skeleton animation="wave" />
            </Grid>
            <Grid item xs={4}>
              <Skeleton animation="wave" />
            </Grid>
            <Grid item xs={4}>
              <Skeleton animation="wave" />
            </Grid>
            <Grid item xs={4}>
              <Skeleton animation="wave" />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <MultiProgress
                transitionTime={3}
                elements={[
                  {
                    color: theme.palette.status.ok,
                    value:
                      ((launchDetails!.statistics.executions.passed ?? 0) /
                        launchDetails!.statistics.executions.total) *
                      100,
                  },
                  {
                    color: theme.palette.status.error,
                    value:
                      ((launchDetails!.statistics.executions.failed ?? 0) /
                        launchDetails!.statistics.executions.total) *
                      100,
                  },
                  {
                    color: theme.palette.status.aborted,
                    value:
                      ((launchDetails!.statistics.executions.skipped ?? 0) /
                        launchDetails!.statistics.executions.total) *
                      100,
                  },
                ]}
                height="15"
                roundLastElement={false}
                round={false}
              />
            </Grid>
            <Grid item xs={4}>
              <StyledResults>
                <DefectStatus color={theme.palette.status.ok}>
                  Passed: {launchDetails!.statistics.executions.passed ?? 0}
                </DefectStatus>
              </StyledResults>
            </Grid>
            <Grid item xs={4}>
              <StyledResults>
                <DefectStatus color={theme.palette.status.error}>
                  Failed: {launchDetails!.statistics.executions.failed ?? 0}
                </DefectStatus>
              </StyledResults>
            </Grid>
            <Grid item xs={4}>
              <StyledResults>
                <DefectStatus color={theme.palette.status.aborted}>
                  Skipped: {launchDetails!.statistics.executions.skipped ?? 0}
                </DefectStatus>
              </StyledResults>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <Divider variant="fullWidth" />
        </Grid>
        <Grid item xs={12}>
          {!projectLoading ? (
            <List disablePadding>
              {defects.length > 0 ? (
                defects.map(defect => (
                  <ListItem key={defect.id}>
                    <ListItemText
                      primary={
                        <DefectStatus color={defect.color}>
                          {defect.name}
                        </DefectStatus>
                      }
                    />
                    <ListItemSecondaryAction>
                      {defect.total}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <Typography variant="h6" align="center">
                  No defects found
                </Typography>
              )}
            </List>
          ) : (
            <Skeleton height="8rem" animation="wave" />
          )}
        </Grid>
      </Grid>
    </InfoCard>
  );
};

/** @public */
export const ReportPortalOverviewCard = (props: {
  variant: InfoCardVariants;
}) => {
  const config = useApi(configApiRef);
  const { entity } = useEntity();

  if (!isReportPortalAvailable(entity)) return null;
  if (!config.has('reportPortal.integrations')) return null;

  return <ReportPortalStatisticsCard {...props} />;
};
