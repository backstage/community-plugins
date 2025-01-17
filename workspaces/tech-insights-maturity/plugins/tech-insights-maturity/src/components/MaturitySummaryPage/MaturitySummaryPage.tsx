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
import { useEntity, useRelatedEntities } from '@backstage/plugin-catalog-react';
import Grid from '@mui/material/Grid';
import React from 'react';

import { MaturityRankInfoCard } from '../MaturityRankInfoCard';
import { MaturitySummaryTable } from '../MaturitySummaryTable';
import { getSubEntityFilter } from '../../helpers/utils';

export const MaturitySummaryPage = () => {
  const { entity } = useEntity();
  const { entities } = useRelatedEntities(entity, getSubEntityFilter(entity));

  return (
    <Grid container>
      <Grid item md={3}>
        <MaturityRankInfoCard entity={entity} />
      </Grid>
      <Grid item md={9}>
        {entities && <MaturitySummaryTable entities={entities} />}
      </Grid>
    </Grid>
  );
};
