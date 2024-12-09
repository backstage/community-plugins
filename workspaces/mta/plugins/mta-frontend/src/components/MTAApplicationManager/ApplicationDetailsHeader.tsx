import React from 'react';
import { Box, Grid, CircularProgress } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { Application } from '../../api/api';
import { ApplicationDetailsForm } from './ApplicationDetailsForm';
import { useFetchIdentities } from '../../queries/mta';

interface ApplicationDetailsHeaderProps {
  application: Application;
  setApplication: (application: Application) => void;
  isWaiting: boolean;
  setIsWaiting: (isWaiting: boolean) => void;
}

export const ApplicationDetailsHeader = ({
  application,
  setApplication,
  isWaiting,
  setIsWaiting,
}: ApplicationDetailsHeaderProps) => {
  const { identities, isFetching } = useFetchIdentities();
  if (isFetching || isWaiting) {
    return (
      <Grid item xs={12} md={6}>
        <InfoCard title="MTA Application" subheader={`${application.name}`}>
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </InfoCard>
      </Grid>
    );
  }
  return (
    <Grid item xs={12} md={6}>
      <InfoCard title="MTA Application" subheader={`${application.name}`}>
        <ApplicationDetailsForm
          application={application}
          setApplication={setApplication}
          identities={identities || []}
          isLoadingIdentities={isFetching}
          setIsWaiting={setIsWaiting}
          isWaiting={isWaiting}
        />
      </InfoCard>
    </Grid>
  );
};

export default ApplicationDetailsHeader;
