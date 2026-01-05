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
import { useMemo } from 'react';

import { makeStyles } from '@mui/styles';
import ListItemText from '@mui/material/ListItemText';

import { Grid, Text } from '@backstage/ui';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { ResultCheckIcon } from '@backstage-community/plugin-tech-insights-react';
import type { Check } from '@backstage-community/plugin-tech-insights-common';
import {
  ColumnIconError,
  ColumnIconPercent,
  type ManageColumn,
  type GetColumnFunc,
  ColumnIconNoData,
} from '@backstage-community/plugin-manage-react';

import { eqCheck } from '../utils';
import { useEntityInsights, UseEntityInsightsResult } from './hooks';
import { useTableColumnTitle } from './title';

const useStyles = makeStyles(() => ({
  tooltipTextPrimary: {
    fontSize: 'var(--bui-font-size-3) !important',
  },
}));

interface CombinedColumnProps {
  entity: Entity;
  useEntityInsightsResult: UseEntityInsightsResult;
  getPercentColor: (percent: number) => string;
}

function CombinedColumn(props: CombinedColumnProps) {
  const {
    entity,
    useEntityInsightsResult: { responses, checks, renderers },
    getPercentColor,
  } = props;

  const mapTitle = useTableColumnTitle();
  const { tooltipTextPrimary } = useStyles();

  const entityRef = stringifyEntityRef(entity);
  const results = responses.get(entityRef);
  if (!results) {
    return <ColumnIconNoData />;
  }

  // Order the results the same way all the time
  const validResults = checks
    .flatMap(check =>
      results
        .filter(res => eqCheck(res.check, check))
        .map(result => ({
          result,
          renderer: renderers.get(result.check.type),
        })),
    )
    .filter((v): v is NonNullable<typeof v> => !!v);

  const tooltipGrid = validResults
    .map(({ result }) => {
      return (
        <>
          <Grid.Item
            key={`${result.check.id}-icon`}
            style={{ alignContent: 'center' }}
          >
            <ResultCheckIcon
              result={result}
              entity={entity}
              disableLinksMenu
              missingRendererComponent={
                <ColumnIconError title="No renderer found for this check" />
              }
            />
          </Grid.Item>
          <Grid.Item
            key={`${result.check.id}-title`}
            style={{ alignContent: 'center' }}
          >
            <ListItemText
              classes={{ primary: tooltipTextPrimary }}
              primary={mapTitle(result.check)}
            />
          </Grid.Item>
        </>
      );
    })
    .filter((v): v is NonNullable<typeof v> => !!v);

  const tooltipContent = (
    <Grid.Root
      columns="2"
      gap="2"
      style={{
        rowGap: 0,
        gridTemplateColumns: 'max-content max-content',
      }}
    >
      {tooltipGrid}
    </Grid.Root>
  );

  if (!validResults.length) {
    return <ColumnIconNoData />;
  }

  const succeeded = validResults.filter(
    ({ result, renderer }) => !renderer?.isFailed?.(result),
  ).length;
  const rate = succeeded / validResults.length;

  const percent = Math.round(rate * 100);

  const color = getPercentColor(percent);

  return (
    <ColumnIconPercent
      percent={percent}
      color={color}
      showPercent
      after={
        <Text variant="body-small">
          {succeeded}/{validResults.length}
        </Text>
      }
      title={tooltipGrid.length === 0 ? undefined : tooltipContent}
    />
  );
}

export function makeGetColumn(
  customCheckFilter: ((check: Check) => boolean) | undefined,
  customShowEmpty: boolean | undefined,
): GetColumnFunc {
  return function useColumn(entities): ManageColumn {
    const useEntityInsightsResult = useEntityInsights(
      entities,
      customCheckFilter,
      customShowEmpty,
    );

    const { getPercentColor } = useEntityInsightsResult;

    // We need unique id's for the columns if their render function has changed,
    // or there's gonna be a UI warning from material-table
    const id = useMemo(() => {
      const newId = `${Math.random() * 1.001}`.slice(2);
      return newId;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useEntityInsightsResult, getPercentColor]);

    return useMemo(
      () => ({
        id: `tech-insights-merged-result-${id}`,
        title: 'Tech Insights',
        render: ({ entity }) => {
          return (
            <CombinedColumn
              entity={entity}
              useEntityInsightsResult={useEntityInsightsResult}
              getPercentColor={getPercentColor}
            />
          );
        },
      }),
      [id, useEntityInsightsResult, getPercentColor],
    );
  };
}
