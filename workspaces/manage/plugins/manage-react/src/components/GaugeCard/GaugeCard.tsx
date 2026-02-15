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
import { ComponentProps, ReactNode } from 'react';

import { Box, Card, CardBody, CardHeader, Text } from '@backstage/ui';

import { useTheme } from '@material-ui/core';

import { CircularProgress } from '../CircularProgress';

import { GaugeCard, GaugePropsGetColor } from '@backstage/core-components';

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export type GaugeCardProps = Pick<
  ComponentProps<typeof GaugeCard>,
  'size' | 'alignGauge' | 'variant' | 'description' | 'subheader'
>;

/** @public */
export interface ManageGaugeCardProps {
  /**
   * Title of the card
   */
  title: ReactNode;

  /**
   * A number between 0 and 1 defining the progress (0% - 100%)
   */
  progress: number;

  /**
   * Function which turns a value into a color
   *
   * @deprecated Use {@link ManageGaugeCardProps.color | color} instead
   */
  getColor?: GaugePropsGetColor;

  /**
   * The color of the progress indicator.
   */
  color?: string;

  /**
   * Optional gauge card props
   *
   * @deprecated Use the new frontend system instead
   */
  gaugeCardProps?: GaugeCardProps;
}

/**
 * This component is `@backstage/core-component`'s GaugeCard with pre-defined
 * defaults.
 *
 * @public
 */
export function ManageGaugeCard(props: ManageGaugeCardProps) {
  const { title, progress } = props;

  const { palette } = useTheme();

  const color = (() => {
    if (props.color) {
      return props.color;
    } else if (props.getColor) {
      return props.getColor({ value: progress * 100, max: 100, palette });
    }
    return 'primary';
  })();

  return (
    <Card style={{ width: '140px' }}>
      <CardHeader>
        <Text variant="body-medium" weight="bold">
          {title}
        </Text>
      </CardHeader>
      <CardBody style={{ alignContent: 'end' }}>
        <Box style={{ marginInline: 'auto' }}>
          <CircularProgress
            progress={progress}
            color={color}
            size={100}
            style={{ marginInline: 'auto' }}
          />
        </Box>
      </CardBody>
    </Card>
  );
}
