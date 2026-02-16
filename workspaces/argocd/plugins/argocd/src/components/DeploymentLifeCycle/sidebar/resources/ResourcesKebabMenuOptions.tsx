/*
 * Copyright 2024 The Backstage Authors
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
import type { MouseEvent } from 'react';

import { useState } from 'react';
import {
  createStyles,
  IconButton,
  Menu,
  MenuItem,
  makeStyles,
  Theme,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useTranslation } from '../../../../hooks/useTranslation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionButton: {
      color: theme.palette.grey[700],
    },
    menuPaper: {
      borderRadius: '4px',
      minWidth: '14rem',
      padding: theme.spacing(0),
      top: theme.spacing(1),
    },
    menuItem: {
      color: theme.palette.grey[800],
      padding: theme.spacing(1, 2),
    },
  }),
);

export const ResourcesKebabMenuOptions = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const { t } = useTranslation();

  return (
    <>
      <IconButton
        aria-label={t(
          'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.iconButton.ariaLabel',
        )}
        aria-controls="kebab-menu"
        aria-haspopup="true"
        onClick={handleClick}
        className={classes.actionButton}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="kebab-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{ paper: classes.menuPaper }}
        transformOrigin={{
          vertical: -40,
          horizontal: 220,
        }}
      >
        <MenuItem onClick={handleClose} className={classes.menuItem}>
          {t(
            'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh',
          )}
        </MenuItem>
        <MenuItem onClick={handleClose} className={classes.menuItem}>
          {t(
            'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync',
          )}
        </MenuItem>
      </Menu>
    </>
  );
};
