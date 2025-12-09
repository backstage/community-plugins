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
import Grid from '@mui/material/Unstable_Grid2';
import { MttrVsSLATile } from '../tiles/MttrVsSLATile';
import { SLAAdherenceTile } from '../tiles/SLAAdherenceTile';
import { RiskOverTimeTile } from '../tiles/RiskOverTimeTile';
import { RepositoryType } from '../../queries';
import StatusTile from '../tiles/StatusTile';
import type { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { isApiiroMetricViewAvailable } from '../../utils';
import { apiiroApiRef } from '../../api';

export const TabMetricsGroup = ({
  repositoryData,
  entity,
  repoId,
  entityRef,
}: {
  repositoryData: RepositoryType;
  entity: Entity;
  repoId: string;
  entityRef: string;
}) => {
  const apiiroApi = useApi(apiiroApiRef);
  const defaultViewChart = apiiroApi.getDefaultAllowMetricsView();
  const allowViewChart =
    isApiiroMetricViewAvailable(entity) ?? defaultViewChart;
  return (
    <Grid container spacing={3} direction="column">
      <Grid container spacing={3}>
        <Grid xs={12} sm={12}>
          <StatusTile repository={repositoryData} />
        </Grid>
        {allowViewChart && (
          <>
            <Grid xs={12} sm={6} lg={4}>
              <MttrVsSLATile repoId={repoId} entityRef={entityRef} />
            </Grid>
            <Grid xs={12} sm={6} lg={4}>
              <RiskOverTimeTile repoId={repoId} entityRef={entityRef} />
            </Grid>
            <Grid xs={12} sm={6} lg={4}>
              <SLAAdherenceTile repoId={repoId} entityRef={entityRef} />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};
