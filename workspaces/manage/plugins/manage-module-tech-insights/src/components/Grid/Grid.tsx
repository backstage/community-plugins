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
import { ReactNode, useCallback, useMemo } from 'react';

import { makeStyles } from '@mui/styles';
import Tooltip from '@mui/material/Tooltip';

import { Box } from '@backstage/ui';
import {
  useCurrentKinds,
  useOwnedEntities,
  GaugeGrid,
  ManageAccordion,
} from '@backstage-community/plugin-manage-react';

import {
  ResponsesForCheck,
  useManageTechInsights,
  useManageTechInsightsForEntities,
} from '../ManageProvider/ManageProviderTechInsights';

import {
  isTitleAsObject,
  ManageTechInsightsMapTitle,
  ManageTechInsightsTitle,
} from '../../title/title';
import { useAccordionTitle } from '../../utils';

const useStyles = makeStyles({
  root: {
    cursor: 'default',
  },
});

/**
 * Props for {@link ManageTechInsightsGrid}.
 *
 * @public
 */
export interface ManageTechInsightsGridProps {
  /**
   * Map the title of the check to either an object `{ title, tooltip? }` or to
   * a JSX element.
   */
  mapTitle?: ManageTechInsightsMapTitle;

  /**
   * Render the grid inside an accordion.
   *
   * Defaults to true.
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
 * Display a set of grid boxes for the tech insights checks given the current
 * shown entities.
 *
 * @deprecated Use the new frontend system instead
 * @public
 */
export function ManageTechInsightsGrid(props: ManageTechInsightsGridProps) {
  const kinds = useCurrentKinds();
  const entities = useOwnedEntities(kinds);

  const inAccordion = props.inAccordion ?? false;

  const { checks, responsesForCheck } =
    useManageTechInsightsForEntities(entities);

  const { getPercentColor, mapTitle: defaultMapTitle } =
    useManageTechInsights();

  const mapTitle = props.mapTitle ?? defaultMapTitle;

  const getRatio = (theseResponses: ResponsesForCheck) => {
    const tot = theseResponses.length;
    const succ = tot - theseResponses.filter(resp => resp.failed).length;

    return tot === 0 ? 1 : succ / tot;
  };

  const getColor = useCallback(
    (progress: number) => getPercentColor(progress * 100),
    [getPercentColor],
  );

  const items = useMemo(() => {
    return checks.map(({ check, uniq }) => {
      const progress = getRatio(responsesForCheck.get(uniq) ?? []);
      return {
        title: <Title titleInfo={mapTitle(check)} />,
        describetion: check.description,
        progress,
        color: getColor(progress),
      };
    });
  }, [checks, mapTitle, responsesForCheck, getColor]);

  const accordionTitle = useAccordionTitle();

  return inAccordion ? (
    <ManageAccordion title={accordionTitle} name="tech-insights">
      <GaugeGrid items={items} />
    </ManageAccordion>
  ) : (
    <Box>
      <GaugeGrid items={items} />
    </Box>
  );
}
