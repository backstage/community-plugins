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

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import { ShortcutIcon } from './ShortcutIcon';
import { EditShortcut } from './EditShortcut';
import { ShortcutApi } from './api';
import { Shortcut } from './types';
import { SidebarItem } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  root: {
    '&:hover #edit': {
      visibility: 'visible',
    },
  },
  button: {
    visibility: 'hidden',
  },
  icon: {
    color: theme.palette.common.white,
    fontSize: 16,
  },
}));

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
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<Element | undefined>();

  const handleClick = (event: React.MouseEvent<Element>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const text = getIconText(shortcut.title);
  const color = api.getColor(shortcut.url);

  return (
    <>
      <Tooltip title={shortcut.title} enterDelay={500}>
        <SidebarItem
          className={classes.root}
          to={shortcut.url}
          text={shortcut.title}
          icon={() => <ShortcutIcon text={text} color={color} />}
        >
          <IconButton
            id="edit"
            data-testid="edit"
            onClick={handleClick}
            className={classes.button}
          >
            <EditIcon className={classes.icon} />
          </IconButton>
        </SidebarItem>
      </Tooltip>
      <EditShortcut
        onClose={handleClose}
        anchorEl={anchorEl}
        api={api}
        shortcut={shortcut}
        allowExternalLinks={allowExternalLinks}
      />
    </>
  );
};
