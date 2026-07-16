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
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from '../../../../hooks/useTranslation';

export const ResourcesKebabMenuOptions = () => {
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
        sx={theme => ({ color: theme.palette.grey[700] })}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="kebab-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: { borderRadius: '4px', minWidth: '14rem', p: 0, mt: 1 },
          },
        }}
        transformOrigin={{
          vertical: -40,
          horizontal: 220,
        }}
      >
        <MenuItem
          onClick={handleClose}
          sx={theme => ({ color: theme.palette.grey[800], py: 1, px: 2 })}
        >
          {t(
            'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh',
          )}
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          sx={theme => ({ color: theme.palette.grey[800], py: 1, px: 2 })}
        >
          {t(
            'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync',
          )}
        </MenuItem>
      </Menu>
    </>
  );
};
