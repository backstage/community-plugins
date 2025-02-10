import React from 'react';
import {
  Button,
  Grid,
  Typography,
} from '@material-ui/core';
import {
    InfoCard
} from '@backstage/core-components';
import { VulnerabilitiesComponent } from '../VulnerabilitiesComponent';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

export const ACSComponent = () => {
    const config = useApi(configApiRef);

    const title: string = "Security findings"
    const subheader: string = "Assess vulnerabilities and policy violations for your component workloads"
    const acsUrl = config.getString('app.acs.acsUrl');

    // Get catalog data
    const { entity } = useEntity();

    const retrieveEntityDeploymentName = () => {
        return entity?.metadata?.annotations?.["acs/deployment-name"];
    }

    return (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Typography variant="subtitle2" gutterBottom>{subheader}</Typography>
          </Grid>
          <Grid item xs justifyContent="flex-end">
            <Button href={`${acsUrl}`} target="_blank" variant="outlined">View in Advanced Cluster Security</Button>
          </Grid>
        </Grid>

        <InfoCard>
          <VulnerabilitiesComponent deploymentName={retrieveEntityDeploymentName()}/>
        </InfoCard>
      </div>
    )
}
