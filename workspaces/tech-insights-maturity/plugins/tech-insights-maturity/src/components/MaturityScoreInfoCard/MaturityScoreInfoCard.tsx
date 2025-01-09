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
import { Entity } from '@backstage/catalog-model';
import { EmptyState, InfoCard, Progress } from '@backstage/core-components';
import {
  MaturityCheckResult,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React from 'react';
import { MaturityCheckTable } from './maturityTableRows';
import { getWarningPanel } from '../../hooks/getWarningPanel';
import { useScoringDataLoader } from '../../hooks/useScoringDataLoader';
import { useScoringRankLoader } from '../../hooks/useScoringRankLoader';

type Props = {
  entity: Entity;
};

export const MaturityScoreInfoCard = ({ entity }: Props) => {
  const { error, loading, value } = useScoringDataLoader(entity);
  const { value: rank } = useScoringRankLoader(entity);

  return (
    <InfoCard title="Checks" variant="fullHeight">
      {loading && <Progress />}

      {error && getWarningPanel(error)}

      {!loading && !value && (
        <div data-testid="maturity-no-data">
          <EmptyState
            missing="info"
            title="No information to display"
            description="There is no data available for this entity"
          />
        </div>
      )}

      {!loading && value && rank && (
        <div data-testid="maturity">
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            alignItems="stretch"
            style={{ height: '100%' }}
            spacing={0}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Grid item>
                <MaturityCheckTable
                  checks={
                    value.filter(
                      x => x.check.metadata!.rank === Rank.Bronze,
                    ) as MaturityCheckResult[]
                  }
                  category={Rank.Bronze}
                  rank={rank}
                />
                <MaturityCheckTable
                  checks={
                    value.filter(
                      x => x.check.metadata!.rank === Rank.Silver,
                    ) as MaturityCheckResult[]
                  }
                  category={Rank.Silver}
                  rank={rank}
                />
                <MaturityCheckTable
                  checks={
                    value.filter(
                      x => x.check.metadata!.rank === Rank.Gold,
                    ) as MaturityCheckResult[]
                  }
                  category={Rank.Gold}
                  rank={rank}
                />
              </Grid>
            </Box>
          </Grid>
        </div>
      )}
    </InfoCard>
  );
};
