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

import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useApi } from '@backstage/core-plugin-api';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { TechInsightsCheckIcon } from '@backstage-community/plugin-tech-insights';
import type { Check } from '@backstage-community/plugin-tech-insights-common/client';
import {
  ColumnIconError,
  ColumnIconPercent,
  type ManageColumn,
  type GetColumnFunc,
  ProgressColor,
} from '@backstage-community/plugin-manage-react';

import { eqCheck } from '../utils';
import { manageTechInsightsApiRef } from '../api';

import { useEntityInsights, UseEntityInsightsResult } from './hooks';
import { NoData } from './NoData';

interface CombinedColumnProps {
  entity: Entity;
  useEntityInsightsResult: UseEntityInsightsResult;
  getPercentColor: (percent: number) => ProgressColor;
}

function CombinedColumn(props: CombinedColumnProps) {
  const {
    entity,
    useEntityInsightsResult: { responses, checks, renderers },
    getPercentColor,
  } = props;

  const entityRef = stringifyEntityRef(entity);
  const results = responses.get(entityRef);
  if (!results) {
    return <NoData />;
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

  const tooltipList = validResults
    .map(({ result }) => {
      return (
        <ListItem disablePadding key={Math.random()}>
          <ListItemIcon>
            <TechInsightsCheckIcon
              result={result}
              entity={entity}
              disableLinksMenu
              missingRendererComponent={
                <ColumnIconError title="No renderer found for this check" />
              }
            />
          </ListItemIcon>
          <ListItemText primary={result.check.name} />
        </ListItem>
      );
    })
    .filter((v): v is NonNullable<typeof v> => !!v);

  const wrapTooltip = (child: JSX.Element) =>
    tooltipList.length === 0 ? (
      child
    ) : (
      <Tooltip
        title={
          <List
            disablePadding
            component="nav"
            aria-label="main mailbox folders"
          >
            {tooltipList}
          </List>
        }
        children={child}
      />
    );

  if (!validResults.length) {
    return <NoData />;
  }

  const succeeded = validResults.filter(
    ({ result, renderer }) => !renderer?.isFailed?.(result),
  ).length;
  const rate = succeeded / validResults.length;

  const percent = Math.round(rate * 100);

  const color = getPercentColor(percent);

  return (
    <Grid container spacing={0}>
      {wrapTooltip(
        <Grid item>
          <div style={{ cursor: 'default' }}>
            <ColumnIconPercent percent={percent} color={color} />
          </div>
        </Grid>,
      )}
      <Grid px={1} item alignContent="center">
        <Typography variant="caption">
          {succeeded}/{validResults.length}
        </Typography>
      </Grid>
    </Grid>
  );
}

export function makeGetColumn(
  checkFilter: ((check: Check) => boolean) | undefined,
  showEmpty: boolean,
): GetColumnFunc {
  return function useColumn(entities): ManageColumn {
    const { getPercentColor } = useApi(manageTechInsightsApiRef);

    const useEntityInsightsResult = useEntityInsights(
      entities,
      checkFilter,
      showEmpty,
    );

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
