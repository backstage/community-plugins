/*
 * Copyright 2026 The Backstage Authors
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
import type { ReactNode } from 'react';
import { Focusable } from 'react-aria-components';

import { CircleDot, Triangle } from 'lucide-react';
import { useComponents } from './../hooks/useComponents';
import { Flex, Text } from '@backstage/ui';

import styles from './TrendLegend.module.css';

type ItemProps = Readonly<{
  icon: ReactNode;
  text: string;
  tooltipText: string;
}>;

const Item = (props: ItemProps) => {
  const { Tooltip, TooltipTrigger } = useComponents();

  return (
    <TooltipTrigger delay={150}>
      <Focusable>
        <Flex align="center" gap="1.5" className={styles.item}>
          {props.icon}
          <Text as="span" className="capitalize">
            {props.text}
          </Text>
        </Flex>
      </Focusable>

      <Tooltip placement="bottom">{props.tooltipText}</Tooltip>
    </TooltipTrigger>
  );
};

export const TrendLegend = () => {
  return (
    <Flex align="center" justify="end" gap="5" py="2" className={styles.legend}>
      <Item
        icon={<CircleDot size={12} />}
        text="New"
        tooltipText="New or unchanged"
      />
      <Item
        icon={<Triangle className={styles.triangleIcon} size={12} />}
        text="Trend up"
        tooltipText="The recommendation has strengthened"
      />
      <Item
        icon={
          <Triangle
            className={`${styles.rotate180} ${styles.triangleIcon}`}
            size={12}
          />
        }
        text="Trend down"
        tooltipText="The recommendation has weakened"
      />
    </Flex>
  );
};
