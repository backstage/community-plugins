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
import { useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useFetchACSData } from '../../common/useFetchACSData';
import { SecurityFindingsComponent } from './SecurityFindingsComponent';

import { DataFilterComponent } from '../DataFilterComponent';

interface Filters {
  selectedEntity: string;
  selectedAttribute: string;
  userText: string;
  selectedCveSeverityOptions: string[];
  selectedCveStatusOptions: string[];
}

interface VulnerabilitiesProps {
  deploymentName: string;
}

export const VulnerabilitiesComponent = ({
  deploymentName,
}: VulnerabilitiesProps) => {
  /* eslint-disable new-cap */
  const { result, isLoading, error } = useFetchACSData(deploymentName);
  /* eslint-enable new-cap */

  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
  }));

  const classes = useStyles();

  const [filters, setFilters] = useState<Filters>({
    selectedEntity: '',
    selectedAttribute: '',
    userText: '',
    selectedCveSeverityOptions: [],
    selectedCveStatusOptions: [],
  });

  if (isLoading) {
    return (
      <InfoCard className={classes.root}>
        <LinearProgress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard>
        <Typography align="center" variant="button">
          Error retrieving data from ACS.
        </Typography>
      </InfoCard>
    );
  }

  if (result.jsonData.length === 0) {
    return (
      <InfoCard>
        <Typography variant="h5" component="h5" align="center">
          No results found for query {deploymentName}.
        </Typography>
        <Typography variant="subtitle1" align="center">
          To configure this component to display data from ACS, add the
          annotation{' '}
          <Box component="pre" sx={{ display: 'inline' }}>
            `rhdh/acs-deployment:
          </Box>{' '}
          followed by a comma separated string of deployment names to the
          entity.
        </Typography>
      </InfoCard>
    );
  }

  return (
    <Box sx={{ minHeight: '500px' }}>
      <DataFilterComponent setFilters={setFilters} />

      <SecurityFindingsComponent data={result} filters={filters} />
    </Box>
  );
};
