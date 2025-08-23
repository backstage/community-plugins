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
import useAsyncRetry from 'react-use/lib/useAsync';

import { EmptyState, InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { getCompoundEntityRef } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { maturityApiRef } from '../../api';
import { MaturityRankInfoCard } from '../MaturityRankInfoCard';
import { Rank } from '@backstage-community/plugin-tech-insights-maturity-common';
import Box from '@mui/material/Box';
import { MaturityCheckTable } from './maturityTableRows';

export const MaturityScorePage = () => {
  const { entity } = useEntity();
  const api = useApi(maturityApiRef);

  const { loading, error, value } = useAsyncRetry(async () => {
    const score = await api.getMaturityScore(entity);
    const facts = await api.getFacts(
      getCompoundEntityRef(entity),
      score.checks?.flatMap(x => x.check.factIds),
    );

    return {
      checks: score.checks,
      rank: score.rank,
      summary: score.summary,
      facts,
    };
  }, [api]);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  } else if (!value) {
    return <EmptyState missing="info" title="No information to display" />;
  }

  return (
    <Grid container>
      <Grid item md={3}>
        <MaturityRankInfoCard summary={value.summary} />
      </Grid>
      <Grid item md={9}>
        <InfoCard title="Checks" variant="fullHeight">
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
                  checks={value.checks.filter(
                    x => x.check.metadata.rank === Rank.Bronze,
                  )}
                  facts={value.facts}
                  category={Rank.Bronze}
                  rank={value.rank}
                />
                <MaturityCheckTable
                  checks={value.checks.filter(
                    x => x.check.metadata.rank === Rank.Silver,
                  )}
                  facts={value.facts}
                  category={Rank.Silver}
                  rank={value.rank}
                />
                <MaturityCheckTable
                  checks={value.checks.filter(
                    x => x.check.metadata.rank === Rank.Gold,
                  )}
                  facts={value.facts}
                  category={Rank.Gold}
                  rank={value.rank}
                />
              </Grid>
            </Box>
          </Grid>
        </InfoCard>
      </Grid>
    </Grid>
  );
};
