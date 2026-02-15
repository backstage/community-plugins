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

import { Box, Flex, Text } from '@backstage/ui';

import Tooltip from '@mui/material/Tooltip';

import { LinearProgress } from '../LinearProgress';
import { CircularProgress } from '../CircularProgress';
import { useParseColor, useProgressStyle } from '../../hooks';
import { useColumnIconStyles } from './styles';

/**
 * Props for {@link ColumnIconPercent}
 *
 * @public
 */
export interface ColumnIconPercentProps {
  /** Optional tooltip title */
  title?: ReactNode;

  /** Percentage value to display, between 0 and 100 */
  percent: number;

  /** Color of the progress indicator */
  color?: string;

  /**
   * Show percentage text inside or aside the progress indicator
   *
   * Defaults to true for circular indicators and false for linear ones
   */
  showPercent?: boolean;

  /** Optional component to render after the progress indicator */
  after?: ReactNode;
}

/**
 * A column icon for showing a percentage as a circular gauge
 *
 * @public
 */
export function ColumnIconPercent(props: ColumnIconPercentProps) {
  const { title, percent, after } = props;

  const { graphics } = useColumnIconStyles();
  const progressStyle = useProgressStyle();
  const color = useParseColor()(props.color ?? 'primary');
  const showPercent =
    props.showPercent ?? (progressStyle === 'circular' ? true : false);

  const inner =
    progressStyle === 'linear' ? (
      <LinearProgress style={{ width: 60 }} color={color} value={percent} />
    ) : (
      <CircularProgressWithLabel
        color={color}
        value={percent}
        showPercent={showPercent}
      />
    );

  const showInlinePercent = progressStyle === 'linear' && props.showPercent;

  const content =
    after || showInlinePercent ? (
      <Flex className={graphics}>
        <Box style={{ alignContent: 'center', cursor: 'default' }}>{inner}</Box>
        {progressStyle === 'linear' && props.showPercent && (
          <Box
            style={{
              cursor: 'default',
              alignItems: 'center',
              textAlign: 'right',
            }}
            minWidth={progressStyle === 'linear' ? '2rem' : undefined}
          >
            <Text variant="body-small">{Math.round(percent)}%</Text>
          </Box>
        )}
        <Box style={{ alignContent: 'center' }}>{after}</Box>
      </Flex>
    ) : (
      inner
    );
  return title ? <Tooltip title={title}>{content}</Tooltip> : content;
}

function CircularProgressWithLabel(props: {
  color: string;
  value: number;
  showPercent: boolean;
}) {
  return (
    <Box position="relative">
      <CircularProgress
        progress={(props.value ?? 0) / 100}
        color={props.color as string}
        size={40}
        textProps={{ variant: 'body-x-small' }}
        showPercentage={props.showPercent}
      />
    </Box>
  );
}
