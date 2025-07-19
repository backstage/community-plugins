import React, { useState } from 'react';
import { Grid, Button, Paper, Typography, makeStyles } from '@material-ui/core';
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
    flexGrow: 1,
    width: '100%',
  },
  sectionContainer: {
    marginBottom: theme.spacing(4),
  },
  sectionHeader: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(2),
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
}));

export const MTAApplicationManager = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);
  const initialApplication = entity.metadata.application as unknown as Application;

  const [application, setApplication] = useState<Application>(initialApplication);
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
          setApplication(appEntity?.metadata.application as unknown as Application);
        })
        .catch(error => {
          throw new Error(`Error fetching application entity: ${error.message}`);
        });
    }
  }, [entity, catalogApi]);

  const [activeSection, setActiveSection] = useState<'details' | 'analysis'>('details');

  const handleSectionChange = (section: 'details' | 'analysis') => {
    setActiveSection(section);
  };

  if (!entity) {
    return (
      <ResponseErrorPanel
        title="No entity context available"
        error={new Error('This component must be used within an entity context.')}
      />
    );
  }

  return (
    <Grid container direction="column" className={classes.root}>
      <Grid item xs={12}>
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            color={activeSection === 'details' ? 'primary' : 'default'}
            className={classes.button}
            onClick={() => handleSectionChange('details')}
            data-testid="application-details-button"
          >
            Application Details
          </Button>
          <Button
            variant="contained"
            color={activeSection === 'analysis' ? 'primary' : 'default'}
            className={classes.button}
            onClick={() => handleSectionChange('analysis')}
            data-testid="analysis-button"
          >
            Analysis
          </Button>
        </div>

        {activeSection === 'details' && (
          <Paper className={classes.sectionContainer}>
            <div className={classes.sectionHeader}>
              <Typography variant="h5" className={classes.sectionTitle}>
                Application Details
              </Typography>
            </div>
            <Grid container spacing={2}>
              <ApplicationDetailsHeader
                application={application}
                setApplication={setApplication}
                isWaiting={isWaiting}
                setIsWaiting={setIsWaiting}
              />
              <ApplicationDetails />
            </Grid>
          </Paper>
        )}

        {activeSection === 'analysis' && (
          <Paper className={classes.sectionContainer}>
            <div className={classes.sectionHeader}>
              <Typography variant="h5" className={classes.sectionTitle}>
                Analysis
              </Typography>
            </div>
            <Grid container spacing={2}>
              <AnalysisPage />
              <AnalysisStatusPage application={application} />
            </Grid>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default MTAApplicationManager;
