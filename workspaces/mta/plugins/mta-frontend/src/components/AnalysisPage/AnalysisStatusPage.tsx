import { useEffect, useState, useCallback } from 'react';
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
  const [authError, setAuthError] = useState(false);

  // Get the query result - use isFetching directly, don't copy to local state
  const { tasks, isFetching, isError, fetchError, refetch } = useFetchAppTasks(
    application.id,
  );

  // Check for authentication errors when error state changes
  useEffect(() => {
    if (isError && (fetchError as any)?.response?.status === 401) {
      setAuthError(true);
    } else if (!isError) {
      setAuthError(false);
    }
  }, [isError, fetchError]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setAuthError(false);
    refetch();
  }, [refetch]);

  // Show authentication error message if there's an auth error
  if (authError) {
    return (
      <Grid item xs={12} md={6}>
        <Paper style={{ padding: '16px', backgroundColor: '#fff3f3' }}>
          <Typography variant="h6" color="error">
            Authentication Error (401 Unauthorized)
          </Typography>
          <Typography variant="body1">
            Unable to fetch analysis tasks from the MTA server. This is likely
            because your Backstage client in Keycloak is missing the required
            scopes.
          </Typography>
          <Typography variant="body2" style={{ marginTop: '8px' }}>
            Please ensure a Backstage client is added to your Keycloak realm
            with the necessary scopes (applications:get, analyses:post,
            tasks:get, etc.) to make requests against MTA.
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
            disabled={isFetching}
          >
            Refresh
          </Button>
        }
      >
        <TaskTable tasks={tasks} isFetching={isFetching} />
      </InfoCard>
    </Grid>
  );
};

export default AnalysisStatusPage;
