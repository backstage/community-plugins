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
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import LensIcon from '@material-ui/icons/Lens';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import { useCostGrowthLegendStyles } from '../../utils/styles';

/** @public */
export type LegendItemProps = {
  title: string;
  tooltipText?: string;
  markerColor?: string;
};

/** @public */
export const LegendItem = (props: PropsWithChildren<LegendItemProps>) => {
  const { title, tooltipText, markerColor, children } = props;

  const classes = useCostGrowthLegendStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box
        minHeight={25}
        display="flex"
        flexDirection="row"
        alignItems="center"
      >
        {markerColor && (
          <div className={classes.marker}>
            <LensIcon style={{ fontSize: '1em', fill: markerColor }} />
          </div>
        )}
        <Typography className={classes.title} variant="overline">
          {title}
        </Typography>
        {tooltipText && (
          <Tooltip
            classes={{ tooltip: classes.tooltip }}
            title={
              <Typography className={classes.tooltipText}>
                {tooltipText}
              </Typography>
            }
            placement="top-start"
          >
            <Typography
              component="span"
              role="img"
              aria-label="help"
              className={classes.helpIcon}
            >
              <HelpOutlineOutlinedIcon fontSize="small" />
            </Typography>
          </Tooltip>
        )}
      </Box>
      <Box marginLeft={markerColor ? '1.5em' : 0}>
        <Typography className={classes.h5} variant="h5">
          {children}
        </Typography>
      </Box>
    </Box>
  );
};
