/*
 * Copyright 2021 The Backstage Authors
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

import { useState } from 'react';
import { ButtonIcon, Tooltip } from '@backstage/ui';
import { TooltipTrigger } from 'react-aria-components';
import { RiEditLine } from '@remixicon/react';
import { ShortcutIcon } from './ShortcutIcon';
import { EditShortcut } from './EditShortcut';
import { ShortcutApi } from './api';
import { Shortcut } from './types';
import { SidebarItem } from '@backstage/core-components';
import styles from './ShortcutItem.module.css';

const getIconText = (title: string) =>
  title.split(' ').length === 1
    ? // If there's only one word, keep the first two characters
      // eslint-disable-next-line no-restricted-syntax
      title[0].toUpperCase() + title[1].toLowerCase()
    : // If there's more than one word, take the first character of the first two words
      // eslint-disable-next-line no-restricted-syntax
      title
        .replace(/\B\W/g, '')
        .split(' ')
        .map(s => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

type Props = {
  shortcut: Shortcut;
  api: ShortcutApi;
  allowExternalLinks?: boolean;
};

export const ShortcutItem = ({ shortcut, api, allowExternalLinks }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const text = getIconText(shortcut.title);
  const color = api.getColor(shortcut.url);

  return (
    <>
      <TooltipTrigger delay={500}>
        <SidebarItem
          className={styles.root}
          to={shortcut.url}
          text={shortcut.title}
          icon={() => <ShortcutIcon text={text} color={color} />}
        >
          <ButtonIcon
            id="edit"
            data-testid="edit"
            onPress={handleClick}
            className={styles.button}
            icon={<RiEditLine className={styles.icon} />}
            aria-label="Edit shortcut"
            variant="tertiary"
          />
        </SidebarItem>
        <Tooltip>{shortcut.title}</Tooltip>
      </TooltipTrigger>
      <EditShortcut
        onClose={handleClose}
        isOpen={isOpen}
        api={api}
        shortcut={shortcut}
        allowExternalLinks={allowExternalLinks}
      />
    </>
  );
};
