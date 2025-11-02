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

import { useApi } from '@backstage/core-plugin-api';
import { useEntity, useRelatedEntities } from '@backstage/plugin-catalog-react';
import { EmptyState, Progress } from '@backstage/core-components';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { MaturityRankInfoCard } from '../MaturityRankInfoCard';
import { MaturitySummaryTable } from '../MaturitySummaryTable';
import { getSubEntityFilter } from '../../helpers/utils';
import { maturityApiRef } from '../../api';

export const MaturitySummaryPage = () => {
  const { entity } = useEntity();
  const { entities } = useRelatedEntities(entity, getSubEntityFilter(entity));

  const api = useApi(maturityApiRef);
  const { value, loading, error } = useAsyncRetry(
    async () => api.getMaturitySummary(entity),
    [api, entity],
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  } else if (!value) {
    return <EmptyState missing="info" title="No information to display" />;
  }

  return (
    <Grid container spacing={1}>
      <Grid item md={3}>
        <MaturityRankInfoCard summary={value} />
      </Grid>
      <Grid item md={9}>
        {entities && <MaturitySummaryTable entities={entities} />}
      </Grid>
    </Grid>
  );
};
