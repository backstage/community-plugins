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
import {
  Content,
  EmptyState,
  ErrorPanel,
  Header,
  Page,
  Progress,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import Grid from '@mui/material/Grid';
import useAsyncRetry from 'react-use/lib/useAsync';
import { MaturityChartCard } from '../MaturityChartCard';

export const MaturityPage = () => {
  const catalogApi = useApi(catalogApiRef);

  const { value: entities, error } = useAsyncRetry(async () => {
    const entitiesList = await catalogApi.getEntities({
      filter: { kind: ['Component'] },
    });
    return entitiesList.items;
  }, [catalogApi]);

  // MaturityChartCard requests check results once, on mount. Mounting it
  // before the Components arrive, or when there are none, would request them
  // for an empty list, which the backend reads as every entity with facts.
  let content;
  if (error) {
    content = <ErrorPanel error={error} />;
  } else if (entities?.length === 0) {
    content = (
      <EmptyState
        missing="data"
        title="No Components to rank"
        description="The maturity chart ranks Components, and the catalog has none."
      />
    );
  } else {
    content = (
      <Grid container>
        <Grid item md={4}>
          {entities ? <MaturityChartCard entities={entities} /> : <Progress />}
        </Grid>
      </Grid>
    );
  }

  return (
    <Page themeId="home">
      <Header title="Maturity" />
      <Content>{content}</Content>
    </Page>
  );
};
