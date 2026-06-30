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

import { Link } from '@backstage/core-components';
import { Text, Flex, Box } from '@backstage/ui';
import { ReactNode } from 'react';
import styles from './RatingCard.module.css';

export const RatingCard = ({
  leftSlot,
  rightSlot,
  title,
  titleIcon,
  link,
  compact,
}: {
  leftSlot: ReactNode;
  rightSlot: ReactNode;
  title?: string;
  titleIcon?: ReactNode;
  link: string;
  compact?: boolean;
}) => {
  return (
    <Link to={link} color="inherit" underline="none">
      <Box className={compact ? '' : styles.root}>
        <Flex
          direction="row"
          align="center"
          justify="center"
          className={styles.upper}
        >
          <div className={styles.left}>{leftSlot}</div>
          <div className={styles.right}>{rightSlot}</div>
        </Flex>
        {!compact && (
          <Box className={styles.cardTitle}>
            <Text className={styles.wrapIcon}>
              {titleIcon} {title}
            </Text>
          </Box>
        )}
      </Box>
    </Link>
  );
};
