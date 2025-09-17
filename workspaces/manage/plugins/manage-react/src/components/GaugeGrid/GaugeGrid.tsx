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
import { ReactNode } from 'react';

import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Grid, { GridOwnProps } from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const useStyles = makeStyles(theme => ({
  gridRootWithoutBottomMargin: {
    marginBottom: 0,
  },
  gridItem: {
    overflow: 'visible',
  },
  box: {
    lineHeight: 0,
    borderRadius: theme.shape.borderRadius,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    // boxShadow: theme.shadows[2],
  },
  percentText: {
    color: theme.palette.text.secondary,
  },
}));

/** @public */
export interface ManageGaugeGridProps {
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

  /**
   * Items to display in the grid
   */
  items: {
    /**
     * Title of the card
     */
    title: ReactNode;

    /**
     * Description of the item
     */
    description?: ReactNode;

    /**
     * A number between 0 and 1 defining the progress (0% - 100%)
     */
    progress: number;
  }[];

  /**
   * Function which turns a progress number (between 0 and 1) into a color
   */
  getColor: (percent: number) => string;

  /**
   * Optionally disable the bottom margin of the grid
   */
  noBottomMargin?: boolean;
}

/** @public */
export function ManageGaugeGrid(props: ManageGaugeGridProps) {
  const { containerProps, items, getColor, noBottomMargin } = props;

  const { gridRootWithoutBottomMargin, gridItem, box, percentText } =
    useStyles();

  const content = (
    <Grid
      columnSpacing={2}
      marginBottom={2}
      {...containerProps}
      className={noBottomMargin ? gridRootWithoutBottomMargin : undefined}
      container
    >
      {items.map(({ title, progress }, i) => {
        const value = progress * 100;
        const color = getColor(progress);

        return (
          <Grid item key={i} padding={0} className={gridItem}>
            <div className={box} style={{ borderLeftColor: color }}>
              <Grid container spacing={0} padding={1} columnSpacing={1}>
                <Grid item>
                  <Typography variant="body2" className={percentText}>
                    {Math.round(value)}%
                  </Typography>
                </Grid>
                <Grid item alignContent="center">
                  {title}
                </Grid>
              </Grid>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );

  return <Box>{content}</Box>;
}
