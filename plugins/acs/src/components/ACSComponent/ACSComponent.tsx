import React from 'react';
import {
  Button,
  Grid,
  Tab,
  Tabs,
} from '@material-ui/core';
import {
    InfoCard
} from '@backstage/core-components';
import { VulnerabilitiesComponent } from '../VulnerabilitiesComponent';

export function ACSComponent() {
    const title: string = "Security findings"
    const subheader: string = "Assess vulnerabilities and policy violations for your component workloads"

    return (
      <div>
        <InfoCard title={title} subheader={subheader}>
          <Button variant="outlined">View in Advanced Cluster Security</Button>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <VulnerabilitiesComponent />
            </Grid>
          </Grid>
        </InfoCard>
      </div>
    )
}

export default ACSComponent;