/*
 * Copyright 2026 The Backstage Authors
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
import { Box, Grid, CircularProgress } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { Application } from '../../api/api';
import { ApplicationDetailsForm } from './ApplicationDetailsForm';
import { useFetchIdentities } from '../../queries/mta';

interface ApplicationDetailsHeaderProps {
  application: Application;
  setApplication: (application: Application) => void;
  isWaiting: boolean;
  setIsWaiting: (isWaiting: boolean) => void;
}

export const ApplicationDetailsHeader = ({
  application,
  setApplication,
  isWaiting,
  setIsWaiting,
}: ApplicationDetailsHeaderProps) => {
  const { identities, isFetching } = useFetchIdentities();
  if (isFetching || isWaiting) {
    return (
      <Grid item xs={12} md={6}>
        <InfoCard title="MTA Application" subheader={`${application.name}`}>
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </InfoCard>
      </Grid>
    );
  }
  return (
    <Grid item xs={12} md={6}>
      <InfoCard title="MTA Application" subheader={`${application.name}`}>
        <ApplicationDetailsForm
          application={application}
          setApplication={setApplication}
          identities={identities || []}
          isLoadingIdentities={isFetching}
          setIsWaiting={setIsWaiting}
          isWaiting={isWaiting}
        />
      </InfoCard>
    </Grid>
  );
};

export default ApplicationDetailsHeader;
