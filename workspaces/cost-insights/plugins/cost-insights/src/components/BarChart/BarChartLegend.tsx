/*
 * Copyright 2020 The Backstage Authors
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

import React, { PropsWithChildren } from 'react';
import Box from '@material-ui/core/Box';
import { useTheme } from '@material-ui/core/styles';
import { LegendItem } from '../LegendItem';
import { currencyFormatter } from '../../utils/formatters';
import { CostInsightsTheme } from '../../types';
import { useBarChartLayoutStyles as useStyles } from '../../utils/styles';
import { useConfig } from '../../hooks';

/** @public */
export type BarChartLegendOptions = {
  previousName: string;
  previousFill: string;
  currentName: string;
  currentFill: string;
  hideMarker?: boolean;
};

/** @public */
export type BarChartLegendProps = {
  costStart: number;
  costEnd: number;
  options?: Partial<BarChartLegendOptions>;
};

/** @public */
export const BarChartLegend = (
  props: PropsWithChildren<BarChartLegendProps>,
) => {
  const { costStart, costEnd, options = {}, children } = props;

  const theme = useTheme<CostInsightsTheme>();
  const classes = useStyles();
  const { baseCurrency } = useConfig();

  const data = Object.assign(
    {
      previousName: 'Previous',
      previousFill: theme.palette.lightBlue,
      currentName: 'Current',
      currentFill: theme.palette.darkBlue,
    },
    options,
  );

  return (
    <Box className={classes.legend} display="flex" flexDirection="row">
      <Box marginRight={2}>
        <LegendItem
          title={data.previousName}
          markerColor={options.hideMarker ? undefined : data.previousFill}
        >
          {currencyFormatter(baseCurrency).format(costStart)}
        </LegendItem>
      </Box>
      <Box marginRight={2}>
        <LegendItem
          title={data.currentName}
          markerColor={options.hideMarker ? undefined : data.currentFill}
        >
          {currencyFormatter(baseCurrency).format(costEnd)}
        </LegendItem>
      </Box>
      {children}
    </Box>
  );
};
