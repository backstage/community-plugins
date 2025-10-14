import React, { useEffect, useState } from 'react';
import { Grid, Button, Paper, Typography } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { useFetchAppTasks } from '../../queries/mta';
import { Application } from '../../api/api';
import { InfoCard } from '@backstage/core-components';
import TaskTable from './TaskTable';

interface IAnalysisStatusPageProps {
  application: Application;
}
const AnalysisStatusPage = (props: IAnalysisStatusPageProps) => {
  const { application } = props;
  // Use state to store tasks locally
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const [isLocalFetching, setIsLocalFetching] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Get the query result but don't use it directly in the render
  const { tasks, isFetching, isError, fetchError, refetch } = useFetchAppTasks(application.id);

  // Update local state when tasks change
  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
    setIsLocalFetching(isFetching);

    // Check for authentication errors
    if (isError && (fetchError as any)?.response?.status === 401) {
      setAuthError(true);
    }
  }, [tasks, isFetching, isError, fetchError]);

  // Manual refresh function that doesn't cause navigation
  const handleRefresh = () => {
    setIsLocalFetching(true);
    setAuthError(false);
    // Use setTimeout to prevent immediate state updates that might cause issues
    setTimeout(() => {
      refetch()
        .then(() => {
          setIsLocalFetching(false);
        })
        .catch((error: any) => {
          if (error?.response?.status === 401) {
            setAuthError(true);
          }
          setIsLocalFetching(false);
        });
    }, 100);
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
            Unable to fetch analysis tasks from the MTA server. This is likely because your
            Backstage client in Keycloak is missing the required scopes.
          </Typography>
          <Typography variant="body2" style={{ marginTop: '8px' }}>
            Please ensure a Backstage client is added to your Keycloak realm with the necessary
            scopes (applications:get, analyses:post, tasks:get, etc.) to make requests against MTA.
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
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={6}>
      <InfoCard
        title="Analysis Details"
        action={
          <Button
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLocalFetching}
          >
            Refresh
          </Button>
        }
      >
        <TaskTable tasks={localTasks} isFetching={isLocalFetching} />
      </InfoCard>
    </Grid>
  );
};
export default AnalysisStatusPage;