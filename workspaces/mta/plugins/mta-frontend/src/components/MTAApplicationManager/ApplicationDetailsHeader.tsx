import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Paper, Typography, Button } from '@material-ui/core';
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
  const { identities, isFetching, isError, fetchError, refetch } = useFetchIdentities();
  const [authError, setAuthError] = useState(false);

  // Check for authentication errors
  useEffect(() => {
    if (isError && (fetchError as any)?.response?.status === 401) {
      setAuthError(true);
    }
  }, [isError, fetchError]);

  // Handle retry
  const handleRetry = () => {
    setAuthError(false);
    refetch().catch((error: any) => {
      if (error?.response?.status === 401) {
        setAuthError(true);
      }
    });
  };

  // Show authentication error message if there's an auth error
  if (authError) {
    return (
      <Grid item xs={12} md={6}>
        <Paper style={{ padding: '16px', backgroundColor: '#fff3f3' }}>
          <Typography variant="h6" color="error">
            Authentication Error (401 Unauthorized)
          </Typography>
          <Typography variant="body1">
            Unable to fetch identity information from the MTA server. This is likely because your
            Backstage client in Keycloak is missing the required scopes.
          </Typography>
          <Typography variant="body2" style={{ marginTop: '8px' }}>
            Please ensure a Backstage client is added to your Keycloak realm with the necessary
            scopes (applications:get, identities:get, etc.) to make requests against MTA.
          </Typography>
          <Typography variant="body2" style={{ marginTop: '8px' }}>
            See{' '}
            <a href="../KEYCLOAK_SETUP.md" target="_blank" rel="noopener noreferrer">
              KEYCLOAK_SETUP.md
            </a>{' '}
            for detailed instructions.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: '16px' }}
            onClick={handleRetry}
          >
            Retry
          </Button>
        </Paper>
      </Grid>
    );
  }

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
