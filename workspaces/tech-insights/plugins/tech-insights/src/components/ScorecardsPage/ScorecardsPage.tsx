/*
 * Copyright 2021 The Backstage Authors
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

import React, { useState } from 'react';
import {
  Content,
  ErrorPanel,
  Header,
  HeaderLabel,
  Page,
  TableColumn,
  Table,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Check, techInsightsApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';
import { BulkCheckResponse } from '@backstage-community/plugin-tech-insights-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { ScorecardsList } from '../ScorecardsList';
import Grid from '@material-ui/core/Grid';
import { Filters } from './Filters';

const tableColumns: TableColumn<BulkCheckResponse[0]>[] = [
  {
    field: 'entity',
    title: 'Entity',
    render: row => <EntityRefLink entityRef={row.entity} />,
  },
  {
    field: 'results',
    title: 'Results',
    render: row => <ScorecardsList checkResults={row.results} />,
  },
];

export const ScorecardsPage = () => {
  const api = useApi(techInsightsApiRef);
  const [filterSelectedChecks, setFilterSelectedChecks] = useState<Check[]>([]);
  const [filterWithResults, setFilterWithResults] = useState<boolean>(true);

  const { value, loading, error } = useAsync(async () => {
    const checks = await api.getAllChecks();
    const result = await api.runBulkChecks([], filterSelectedChecks);

    return {
      checks,
      result: filterWithResults
        ? result.filter(response => response.results.length > 0)
        : result,
    };
  }, [api, filterSelectedChecks, filterWithResults]);

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <Page themeId="tool">
      <Header title="Tech insights">
        <HeaderLabel label="Entities" value={value?.result.length ?? 0} />
        <HeaderLabel label="Checks" value={value?.checks.length ?? 0} />
      </Header>
      <Content>
        <Grid container>
          <Grid item style={{ width: '300px' }}>
            <Filters
              checksChanged={checks => setFilterSelectedChecks(checks)}
              withResultsChanged={withResults =>
                setFilterWithResults(withResults)
              }
            />
          </Grid>
          <Grid item xs>
            <Table
              columns={tableColumns}
              data={value?.result ?? []}
              isLoading={loading}
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
