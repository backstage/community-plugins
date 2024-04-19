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

import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LensIcon from '@material-ui/icons/Lens';
import { useTooltipStyles as useStyles } from '../../utils/styles';

/** @public */
export type TooltipItem = {
  fill: string;
  label?: string;
  value?: string;
};

/** @public */
export type BarChartTooltipItemProps = {
  item: TooltipItem;
};

/** @public */
export const BarChartTooltipItem = (props: BarChartTooltipItemProps) => {
  const { item } = props;

  const classes = useStyles();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      minHeight={25}
    >
      <Box display="flex" alignContent="center" marginRight=".5em">
        <Box display="flex" alignItems="center" marginRight=".5em">
          <LensIcon className={classes.lensIcon} style={{ fill: item.fill }} />
        </Box>
        <Typography>{item.label}</Typography>
      </Box>
      <Typography display="block">{item.value}</Typography>
    </Box>
  );
};
