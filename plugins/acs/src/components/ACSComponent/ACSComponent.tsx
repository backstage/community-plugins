import React from 'react';
import {
  Button,
  Typography,
} from '@material-ui/core';
import Grid from '@mui/material/Grid2';
import {
    InfoCard
} from '@backstage/core-components';
import { VulnerabilitiesComponent } from '../VulnerabilitiesComponent';
import { useEntity } from '@backstage/plugin-catalog-react';

export function ACSComponent() {
    const title: string = "Security findings"
    const subheader: string = "Assess vulnerabilities and policy violations for your component workloads"

    // Get catalog data
    const { entity } = useEntity();

    // TODO: Discuss potential differences in catalog entity data format across different backstage instances
    //const retrieveServiceName = () => {
    //    return entity?.metadata?.name
    //}

    // TODO: add deployment name label to app interface
    const retrieveEntityDeploymentName = () => {
        console.log("deployment name:", entity?.metadata?.annotations?.["acs/deployment-name"]);
        return entity?.metadata?.annotations?.["acs/deployment-name"];
    }

    retrieveEntityDeploymentName();

    return (
      <div>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 8 }}>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Typography variant="subtitle2" gutterBottom>{subheader}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Button href="#" target="_blank" variant="outlined">View in Advanced Cluster Security</Button>
          </Grid>
        </Grid>

        <InfoCard>
          <VulnerabilitiesComponent deploymentName={retrieveEntityDeploymentName()}/>
        </InfoCard>
      </div>
    )
}

export default ACSComponent;
