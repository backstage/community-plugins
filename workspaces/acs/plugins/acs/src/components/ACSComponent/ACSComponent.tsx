/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Button, Grid, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { VulnerabilitiesComponent } from '../VulnerabilitiesComponent';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

export const ACSComponent = () => {
  const config = useApi(configApiRef);

  const title: string = 'Security findings';
  const subheader: string =
    'Assess vulnerabilities for your component workloads';
  const acsUrl = config.getString('acs.acsUrl');

  // Get catalog data
  const { entity } = useEntity();

  const retrieveEntityDeploymentName = () => {
    const deploymentAnnotation =
      entity?.metadata?.annotations?.['acs/deployment-name'];

    if (deploymentAnnotation) return deploymentAnnotation;

    return '';
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            {subheader}
          </Typography>
        </Grid>
        <Grid item>
          <Button href={`${acsUrl}`} target="_blank" variant="outlined">
            View in Advanced Cluster Security
          </Button>
        </Grid>
      </Grid>

      <InfoCard>
        <VulnerabilitiesComponent
          deploymentName={retrieveEntityDeploymentName()}
        />
      </InfoCard>
    </div>
  );
};
