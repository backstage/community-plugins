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
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import React from 'react';
import { MaturitySummaryCardContent } from './MaturitySummaryCardContent';
import { useScoringSummaryLoader } from '../../hooks/useScoringSummaryLoader';
import { MaturityHelp } from '../../helpers/MaturityHelp';
import { MaturityRankAvatar } from '../MaturityRankAvatar';

export const MaturitySummaryInfoCard = () => {
  const { entity } = useEntity();
  const { value, loading } = useScoringSummaryLoader(entity);

  if (!value || loading) return <></>;

  return (
    <InfoCard
      title={
        <Grid container>
          <Grid item md={8}>
            Maturity
            <MaturityHelp />
          </Grid>
          <Grid item md={4} style={{ padding: 2 }}>
            <MaturityRankAvatar value={value} entity={entity} variant="chip" />
          </Grid>
        </Grid>
      }
    >
      <CardContent>
        <MaturitySummaryCardContent summary={value} variant="infoCard" />
      </CardContent>
    </InfoCard>
  );
};
