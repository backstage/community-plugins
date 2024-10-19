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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import makeStyles from '@mui/styles/makeStyles';
import Description from '@mui/icons-material/Description';
import MoreVert from '@mui/icons-material/MoreVert';
import {
  announcementAdminRouteRef,
  categoriesListRouteRef,
} from '../../routes';
import Box from '@mui/material/Box';

const useStyles = makeStyles({
  button: {
    color: 'white',
  },
});

export function ContextMenu() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const announcementsLink = useRouteRef(announcementAdminRouteRef);
  const categoriesLink = useRouteRef(categoriesListRouteRef);
  const navigate = useNavigate();

  const onOpen = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(undefined);
  };

  return (
    <Box data-testid="announcements-context-menu">
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={onOpen}
        data-testid="menu-button"
        color="inherit"
        className={classes.button}
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          <MenuItem onClick={() => navigate(announcementsLink())}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Admin" />
          </MenuItem>
          <MenuItem onClick={() => navigate(categoriesLink())}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </MenuItem>
        </MenuList>
      </Popover>
    </Box>
  );
}
