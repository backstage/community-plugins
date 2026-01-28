import React, { useState } from 'react';
import {
  Grid,
  Tab,
  Tabs,
  makeStyles,
  Button,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { ResponseErrorPanel, InfoCard } from '@backstage/core-components';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { AnalysisPage } from '../AnalysisPage/AnalysisPage';
import { Application } from '../../api/api';
import { ApplicationDetailsHeader } from './ApplicationDetailsHeader';
import { useApi } from '@backstage/core-plugin-api';
import ApplicationDetails from '../AppCard/ApplicationDetails';
import AnalysisStatusPage from '../AnalysisPage/AnalysisStatusPage';
import { mtaApiRef } from '../../api/api';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1, // Ensures the container takes full height
    width: '100%', // Ensures the container takes full width
  },
  tabPanel: {
    display: 'block', // Ensures the tab panel is always visible when selected
    width: '100%', // Ensures the tab panel takes full width
    minHeight: 500, // Adjust this value based on your content needs
    flex: '1 0 auto', // Prevents flex items from shrinking
  },
  tabBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
  },
}));

export const MTAApplicationManager = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);
  const mtaApi = useApi(mtaApiRef);

  // Initialize application state more safely
  const [application, setApplication] = useState<Application | null>(
    (entity?.metadata?.application as unknown as Application) || null,
  );
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState(0);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Use useCallback to memoize the fetch function
  const fetchApplication = React.useCallback(async () => {
    if (!entity) return;

    try {
      const entityRef = `${entity.kind.toLowerCase()}:${
        entity.metadata.namespace || 'default'
      }/${entity.metadata.name}`;

      const appEntity = await catalogApi.getEntityByRef(entityRef);
      const app = appEntity?.metadata.application as unknown as Application;

      if (app) {
        setApplication(app);
        setError(null);
      } else {
        setError('No application metadata found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error fetching application entity: ${errorMessage}`);
    }
  }, [entity, catalogApi]);

  // Only re-run when entity changes (not catalogApi)
  React.useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleTabChange = (newValue: any) => {
    setTab(newValue);
  };

  if (!entity) {
    return (
      <ResponseErrorPanel
        title="No entity context available"
        error={
          new Error('This component must be used within an entity context.')
        }
      />
    );
  }

  const handleConnectToMTA = async () => {
    setIsConnecting(true);
    try {
      // Use the MTA API which handles OIDC authentication automatically
      // This will trigger the OAuth popup if the user isn't authenticated
      await mtaApi.getTargets();

      // If we got here, auth succeeded - reload to refresh data
      window.location.reload();
    } catch (err) {
      setError(`Failed to connect to MTA: ${err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  if (error) {
    // Show a more helpful message when no application is linked
    if (error.includes('No application metadata found')) {
      return (
        <InfoCard title="MTA Integration">
          <Typography variant="body1" paragraph>
            This entity is not linked to an MTA application. The MTA Entity
            Provider needs to be configured to automatically sync applications
            from MTA.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            To test the OAuth flow, click the button below to connect to MTA.
            This will redirect you to Keycloak for authentication.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnectToMTA}
            disabled={isConnecting}
            startIcon={isConnecting ? <CircularProgress size={20} /> : null}
          >
            {isConnecting ? 'Connecting...' : 'Connect to MTA'}
          </Button>
        </InfoCard>
      );
    }

    return (
      <ResponseErrorPanel
        title="Failed to load application"
        error={new Error(error)}
      />
    );
  }

  if (!application) {
    return <div>Loading application...</div>;
  }

  return (
    <Grid container direction="column" className={classes.root}>
      <Grid item xs={12} className={classes.tabBar}>
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={(_, value) => handleTabChange(value)}
          indicatorColor="primary"
          textColor="primary"
          aria-label="application tabs"
        >
          <Tab label="Application Details" />
          <Tab label="Analysis" />
        </Tabs>

        {/* Conditionally render tabs to avoid unnecessary queries */}
        {tab === 0 && (
          <Grid
            container
            spacing={2}
            style={{
              marginTop: '2vh',
              minHeight: '50vh',
            }}
          >
            <ApplicationDetailsHeader
              application={application}
              setApplication={setApplication}
              isWaiting={isWaiting}
              setIsWaiting={setIsWaiting}
            />
            <ApplicationDetails />
          </Grid>
        )}

        {tab === 1 && (
          <Grid
            container
            spacing={2}
            style={{
              marginTop: '2vh',
              minHeight: '50vh',
            }}
          >
            <AnalysisPage />
            <AnalysisStatusPage application={application} />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default MTAApplicationManager;
