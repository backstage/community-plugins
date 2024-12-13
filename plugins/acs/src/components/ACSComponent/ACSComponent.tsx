import React from 'react';
import {
  Button,
  Typography,
} from '@material-ui/core';
import Stack from '@mui/material/Stack';
import {
    InfoCard
} from '@backstage/core-components';
import { VulnerabilitiesComponent } from '../VulnerabilitiesComponent';

export function ACSComponent() {
    const title: string = "Security findings"
    const subheader: string = "Assess vulnerabilities and policy violations for your component workloads"

    return (
      <div>
        <Stack direction="row">
          <div>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Typography variant="subtitle2" gutterBottom>{subheader}</Typography>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Button variant="outlined">View in Advanced Cluster Security</Button>
          </div>
        </Stack>
        
        
        <InfoCard>
          <VulnerabilitiesComponent />
        </InfoCard>
      </div>
    )
}

export default ACSComponent;