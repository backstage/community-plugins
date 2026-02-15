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
import { GridOwnProps } from '@mui/material/Grid';

import { Box, Grid, TagGroup, Tag, Text } from '@backstage/ui';
import { useParseColor } from '../../hooks';
import { LinearProgress } from '../LinearProgress';

const useStyles = makeStyles(theme => ({
  percentText: {
    fontSize: 'var(--bui-font-size-2)',
    cursor: 'default',
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

    /**
     * The color of the progress indicator.
     */
    color?: string;
  }[];

  /**
   * Function which turns a progress number (between 0 and 1) into a color
   *
   * @deprecated Use ManageGaugeGridProps.items[].color instead
   */
  getColor?: (percent: number) => string;

  /**
   * Optionally disable the bottom margin of the grid
   */
  noBottomMargin?: boolean;
}

/** @public */
export function ManageGaugeGrid(props: ManageGaugeGridProps) {
  const { items, getColor, noBottomMargin } = props;

  const { percentText } = useStyles();

  const parseColor = useParseColor();

  const getProgressColor = useCallback(
    (item: ManageGaugeGridProps['items'][number]) =>
      parseColor(item.color ?? getColor?.(item.progress) ?? 'primary'),
    [getColor, parseColor],
  );

  const tagGroupItems = items.map((item, i) => ({
    ...item,
    id: `${i}-${item.title}`,
  }));

  const buiContent = (
    <TagGroup
      aria-label="Values"
      key={tagGroupItems.map(item => item.id).join('$$')}
      items={tagGroupItems}
    >
      {item => {
        const value = item.progress * 100;
        const color = getProgressColor(item);

        return (
          <Tag size="medium" style={{ borderLeftColor: color }}>
            <Grid.Root columns="1" gap="0">
              <Grid.Item
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--bui-space-1)',
                }}
              >
                <Text className={percentText}>{Math.round(value)}%</Text>{' '}
                {item.title}
              </Grid.Item>
              <Grid.Item>
                <LinearProgress color={color} value={value} />
              </Grid.Item>
            </Grid.Root>
          </Tag>
        );
      }}
    </TagGroup>
  );

  return <Box mb={noBottomMargin ? undefined : '2'}>{buiContent}</Box>;
}
