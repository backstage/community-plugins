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
import { useMemo, useEffect, useState } from 'react';
import MultiProgress from 'react-multi-progress';

import { InfoCard, InfoCardVariants, Link } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { LaunchDetails } from '@backstage-community/plugin-report-portal-common';
import { useMultipleLaunchDetails, useProjectDetails } from '../../hooks';
import { isReportPortalAvailable } from '../../utils/isReportPortalAvailable';

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

const LaunchContent = (props: {
  launch: LaunchDetails;
  projectDetails: {
    configuration: {
      subTypes: {
        [key: string]: [
          {
            id: number;
            longName: string;
            color: string;
          },
        ];
      };
    };
  };
  hostName: string;
  projectId: string;
  showLink?: boolean;
}) => {
  const { launch, projectDetails, hostName, projectId, showLink } = props;
  const theme = useTheme();
  const [defects, setDefects] = useState<Defect[]>([]);

  useEffect(() => {
    if (launch && projectDetails) {
      const tempArr: Defect[] = [];
      Object.keys(launch.statistics.defects).forEach(defect => {
        tempArr.push({
          name: projectDetails.configuration.subTypes?.[
            defect.toLocaleUpperCase('en-US')
          ][0].longName,
          total: launch.statistics.defects?.[defect].total,
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
  }, [launch, projectDetails]);

  const {
    passed = 0,
    failed = 0,
    skipped = 0,
    total,
  } = launch.statistics.executions;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MultiProgress
          transitionTime={3}
          elements={[
            {
              color: theme.palette.status.ok,
              value: (passed / total) * 100,
            },
            {
              color: theme.palette.status.error,
              value: (failed / total) * 100,
            },
            {
              color: theme.palette.status.aborted,
              value: (skipped / total) * 100,
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
            Passed: {passed}
          </DefectStatus>
        </StyledResults>
      </Grid>
      <Grid item xs={4}>
        <StyledResults>
          <DefectStatus color={theme.palette.status.error}>
            Failed: {failed}
          </DefectStatus>
        </StyledResults>
      </Grid>
      <Grid item xs={4}>
        <StyledResults>
          <DefectStatus color={theme.palette.status.aborted}>
            Skipped: {skipped}
          </DefectStatus>
        </StyledResults>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="fullWidth" />
      </Grid>
      <Grid item xs={12}>
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
      </Grid>
      {showLink && (
        <Grid item xs={12}>
          <Link
            to={`https://${hostName}/ui/#${projectId}/launches/latest/${launch.id}`}
          >
            View launch on Report Portal →
          </Link>
        </Grid>
      )}
    </Grid>
  );
};

const MultiLaunchCard = (props: {
  launches: LaunchDetails[];
  projectDetails: any;
  hostName: string;
  projectId: string;
  variant: InfoCardVariants;
}) => {
  const { launches, projectDetails, hostName, projectId, variant } = props;
  const theme = useTheme();

  return (
    <InfoCard
      title="Test Statistics"
      variant={variant}
      divider
      deepLink={{
        link: `https://${hostName}/ui/#${projectId}/launches/latest`,
        title: 'Report Portal',
      }}
    >
      {launches.map((launch, index) => {
        const {
          passed = 0,
          failed = 0,
          skipped = 0,
          total,
        } = launch.statistics.executions;

        return (
          <Box key={launch.id}>
            {index > 0 && <Divider />}
            <Accordion
              defaultExpanded={index === 0}
              disableGutters
              elevation={0}
              sx={{ '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" style={{ flexGrow: 1 }}>
                  {launch.name}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  style={{ whiteSpace: 'nowrap', marginLeft: 'auto' }}
                >
                  {total} (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: theme.palette.status.ok,
                      fontWeight: 800,
                    }}
                  >
                    {passed}
                  </Typography>
                  /
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: theme.palette.status.error,
                      fontWeight: 800,
                    }}
                  >
                    {failed}
                  </Typography>
                  /
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: theme.palette.status.aborted,
                      fontWeight: 800,
                    }}
                  >
                    {skipped}
                  </Typography>
                  )
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <LaunchContent
                  launch={launch}
                  projectDetails={projectDetails}
                  hostName={hostName}
                  projectId={projectId}
                  showLink
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        );
      })}
    </InfoCard>
  );
};

const ReportPortalStatisticsCard = (props: { variant: InfoCardVariants }) => {
  const config = useApi(configApiRef);
  const hostsConfig = config.getConfigArray('reportPortal.integrations');

  const { entity } = useEntity();
  const projectId =
    entity.metadata.annotations?.['reportportal.io/project-name'] ?? '';
  const launchNameAnnotation =
    entity.metadata.annotations?.['reportportal.io/launch-name'] ?? '';
  const hostName =
    entity.metadata.annotations?.['reportportal.io/host'] ??
    hostsConfig[0].getString('host');

  const launchNames = useMemo(
    () =>
      launchNameAnnotation
        ? launchNameAnnotation
            .split(',')
            .map(n => n.trim())
            .filter(Boolean)
        : [],
    [launchNameAnnotation],
  );

  const { loading, launches, error } = useMultipleLaunchDetails(
    projectId,
    hostName,
    launchNames,
  );
  const { loading: projectLoading, projectDetails } = useProjectDetails(
    projectId,
    hostName,
  );

  if (!isReportPortalAvailable(entity)) return null;

  if (error) {
    return (
      <InfoCard title="Test Statistics" variant={props.variant} divider>
        <Alert severity="error">{error.message}</Alert>
      </InfoCard>
    );
  }

  if (loading || projectLoading) {
    return (
      <InfoCard title="Test Statistics" variant={props.variant} divider>
        <Grid container spacing={3}>
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
        </Grid>
      </InfoCard>
    );
  }

  if (launches.length === 0) {
    return (
      <InfoCard title="Test Statistics" variant={props.variant} divider>
        <Typography variant="body1" align="center">
          No launches found
        </Typography>
      </InfoCard>
    );
  }

  return (
    <MultiLaunchCard
      launches={launches}
      projectDetails={projectDetails!}
      hostName={hostName}
      projectId={projectId}
      variant={props.variant}
    />
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
