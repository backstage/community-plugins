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

import { Button, Text } from '@backstage/ui';
import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';
import { PATH_SEPARATOR } from '../../../consts/consts';
import { useTranslation } from '../../../hooks/useTranslation';
import { TEST_IDS } from '../../../consts/testids';

import styles from './NavButton.module.css';

/** Button component for navigating between bookmarks */
export const NavButton = ({
  direction,
  onClick,
  treeKey,
}: {
  direction: 'next' | 'previous';
  onClick: () => void;
  treeKey: string;
}) => {
  const { t } = useTranslation();

  const isNext = direction === 'next';
  const buttonText = t(`bookmarkViewer.navButton.${direction}`);
  /** last path item is the button label */
  const bookmarkName = treeKey.split(PATH_SEPARATOR).pop();

  return (
    <Button
      variant="tertiary"
      size="medium"
      data-testid={TEST_IDS.NavButton[direction]}
      onPress={onClick}
      iconStart={!isNext ? <RiArrowLeftLine /> : undefined}
      iconEnd={isNext ? <RiArrowRightLine /> : undefined}
    >
      <span
        className={`${styles.label} ${isNext ? styles.next : styles.previous}`}
      >
        <Text as="small" variant="body-small" color="secondary">
          {buttonText}
        </Text>{' '}
        <Text as="span" variant="body-medium" color="primary">
          {bookmarkName}
        </Text>
      </span>
    </Button>
  );
};
