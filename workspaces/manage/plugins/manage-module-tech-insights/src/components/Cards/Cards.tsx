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
import { ReactNode, useCallback } from 'react';

import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Grid, { GridOwnProps } from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';

import { useApi } from '@backstage/core-plugin-api';
import { GaugePropsGetColor } from '@backstage/core-components';
import {
  useCurrentKinds,
  useOwnedEntities,
  GaugeCard,
  GaugeCardProps,
  ManageAccordion,
} from '@backstage-community/plugin-manage-react';

import {
  ResponsesForCheck,
  useManageTechInsightsForEntities,
} from '../ManageProvider/ManageProviderTechInsights';
import { manageTechInsightsApiRef } from '../../api';
import {
  isTitleAsObject,
  ManageTechInsightsMapTitle,
  ManageTechInsightsTitle,
} from '../../title';
import { useAccordionTitle } from '../../utils';

const useStyles = makeStyles({
  root: {
    cursor: 'default',
  },
});

/**
 * Props for {@link ManageTechInsightsCards}.
 *
 * @public
 */
export interface ManageTechInsightsCardsProps {
  containerProps?: Pick<
    GridOwnProps,
    | 'classes'
    | 'columns'
    | 'columnSpacing'
    | 'direction'
    | 'rowSpacing'
    | 'spacing'
    | 'sx'
    | 'wrap'
    | 'zeroMinWidth'
  >;
  gaugeCardProps?: GaugeCardProps;

  /**
   * Map the title of the check to either an object `{ title, tooltip? }` or to
   * a JSX element.
   */
  mapTitle?: ManageTechInsightsMapTitle;

  /**
   * Render the cards inside an accordion.
   *
   * Defaults to false.
   */
  inAccordion?: boolean;
}

function Title({
  titleInfo,
}: {
  titleInfo: ManageTechInsightsTitle;
}): ReactNode {
  const { root } = useStyles();

  if (isTitleAsObject(titleInfo)) {
    return titleInfo.tooltip ? (
      <Tooltip title={titleInfo.tooltip}>
        <div className={root}>{titleInfo.title}</div>
      </Tooltip>
    ) : (
      <div className={root}>{titleInfo.title}</div>
    );
  }
  return <div className={root}>{titleInfo.content}</div>;
}

/**
 * Display a set of cards for the tech insights checks given the current shown
 * entities.
 *
 * @public
 */
export function ManageTechInsightsCards(props: ManageTechInsightsCardsProps) {
  const { containerProps, gaugeCardProps, inAccordion } = props;

  const kinds = useCurrentKinds();
  const entities = useOwnedEntities(kinds);

  const { checks, responsesForCheck } =
    useManageTechInsightsForEntities(entities);

  const { getPercentColor, mapTitle: defaultMapTitle } = useApi(
    manageTechInsightsApiRef,
  );

  const mapTitle = props.mapTitle ?? defaultMapTitle;

  const getRatio = (theseResponses: ResponsesForCheck) => {
    const tot = theseResponses.length;
    const succ = tot - theseResponses.filter(resp => resp.failed).length;

    return tot === 0 ? 1 : succ / tot;
  };

  const getColor = useCallback<GaugePropsGetColor>(
    args => {
      const rawColor = getPercentColor(args.value);
      const muiColor =
        rawColor === 'inherit' ? 'inherit' : args.palette[rawColor].main;

      return muiColor;
    },
    [getPercentColor],
  );

  const grid = (
    <Grid columnSpacing={2} marginBottom={2} {...containerProps} container>
      {checks.map(({ check, uniq }) => (
        <Grid item key={uniq} padding={0}>
          <GaugeCard
            progress={getRatio(responsesForCheck.get(uniq) ?? [])}
            gaugeCardProps={gaugeCardProps}
            title={<Title titleInfo={mapTitle(check)} />}
            getColor={getColor}
          />
        </Grid>
      ))}
    </Grid>
  );

  const accordionTitle = useAccordionTitle();

  return inAccordion ? (
    <ManageAccordion title={accordionTitle} name="tech-insights">
      {grid}
    </ManageAccordion>
  ) : (
    <Box>{grid}</Box>
  );
}
