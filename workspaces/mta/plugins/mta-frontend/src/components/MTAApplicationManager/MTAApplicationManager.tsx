import React, { useState } from 'react';
import { Grid, Tab, Tabs, makeStyles } from '@material-ui/core';
import { ResponseErrorPanel } from '@backstage/core-components';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { AnalysisPage } from '../AnalysisPage/AnalysisPage';
import { Application } from '../../api/api';
import { ApplicationDetailsHeader } from './ApplicationDetailsHeader';
import { useApi } from '@backstage/core-plugin-api';
import ApplicationDetails from '../AppCard/ApplicationDetails';
import AnalysisStatusPage from '../AnalysisPage/AnalysisStatusPage';

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
  const initialApplication = entity.metadata
    .application as unknown as Application;

  const [application, setApplication] =
    useState<Application>(initialApplication);
  const [isWaiting, setIsWaiting] = React.useState(false);

  React.useEffect(() => {
    if (entity) {
      catalogApi
        .getEntityByRef(
          `${entity.kind.toLowerCase()}:${
            entity.metadata.namespace || 'default'
          }/${entity.metadata.name}`,
        )
        .then(appEntity => {
          setApplication(
            appEntity?.metadata.application as unknown as Application,
          );
        })
        .catch(error => {
          throw new Error(
            `Error fetching application entity: ${error.message}`,
          );
        });
    }
  }, [entity, catalogApi]);

  const [tab, setTab] = React.useState(0);

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
        {tab === 0 && (
          <Grid
            container
            spacing={2}
            style={{ marginTop: '2vh', minHeight: '100vh' }}
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
            style={{ marginTop: '2vh', minHeight: '100vh' }}
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
