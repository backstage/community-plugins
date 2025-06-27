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

import { useMemo, useState } from 'react';
import {
  Content,
  ErrorPanel,
  Header,
  HeaderLabel,
  Page,
  TableColumn,
  Table,
  TableOptions,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  Check,
  BulkCheckResponse,
} from '@backstage-community/plugin-tech-insights-common';
import useAsync from 'react-use/lib/useAsync';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { ScorecardsList } from '../ScorecardsList';
import Grid from '@material-ui/core/Grid';
import { Filters } from './Filters';
import { ExportCsv as exportCsv } from '@material-table/exporters';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import { ScorecardsBadge } from '../ScorecardsBadge';

export const ScorecardsPage = (props: { badge?: boolean; dense?: boolean }) => {
  const api = useApi(techInsightsApiRef);
  const [filterSelectedChecks, setFilterSelectedChecks] = useState<Check[]>([]);
  const [filterWithResults, setFilterWithResults] = useState<boolean>(true);
  const tableOptions: TableOptions = {
    exportAllData: true,
    exportMenu: [
      {
        label: 'Export CSV',
        exportFunc: (cols, datas) => exportCsv(cols, datas, 'tech-insights'),
      },
    ],
    pageSize: props.badge ? 15 : 5,
    pageSizeOptions: props.badge ? [15, 30, 100] : [5, 10, 20],
    padding: `${props.dense ? 'dense' : 'default'}`,
  };

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

  const tableColumns = useMemo(() => {
    const columns: TableColumn<BulkCheckResponse[0]>[] = [
      {
        field: 'entity',
        title: 'Entity',
        render: row => <EntityRefLink entityRef={row.entity} />,
      },
      {
        field: 'results',
        title: 'Results',
        render: row =>
          props.badge ? (
            <ScorecardsBadge checkResults={row.results} />
          ) : (
            <ScorecardsList checkResults={row.results} dense={props.dense} />
          ),
        export: false,
      },
    ];

    (filterSelectedChecks.length === 0
      ? value?.checks || []
      : filterSelectedChecks
    ).forEach(check => {
      columns.push({
        field: check.id,
        title: check.name,
        customExport: row =>
          `${
            row.results.filter(
              result => result && result.check && result.check.id === check.id,
            )[0]?.result
          }`,
        hidden: true,
        export: true,
      });
    });

    return columns;
  }, [props, value, filterSelectedChecks]);

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
              options={tableOptions}
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
