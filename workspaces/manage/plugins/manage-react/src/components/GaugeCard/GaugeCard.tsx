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

import { GaugeCard, GaugePropsGetColor } from '@backstage/core-components';

/** @public */
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
   */
  getColor: GaugePropsGetColor;

  /**
   * Optional gauge card props
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
  const { title, progress, getColor, gaugeCardProps } = props;

  return (
    <GaugeCard
      size="small"
      alignGauge="bottom"
      variant="fullHeight"
      {...gaugeCardProps}
      title={title as string}
      progress={progress}
      getColor={getColor}
    />
  );
}
