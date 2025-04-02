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
import { SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  announcementAdminRouteRef,
  categoriesListRouteRef,
  tagsListRouteRef,
} from '../../routes';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  makeStyles,
  Box,
  IconButton,
  Popover,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import Description from '@material-ui/icons/Description';

const useStyles = makeStyles(theme => ({
  button: {
    color: theme.page.fontColor,
  },
}));

export function ContextMenu() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const announcementsLink = useRouteRef(announcementAdminRouteRef);
  const categoriesLink = useRouteRef(categoriesListRouteRef);
  const tagsLink = useRouteRef(tagsListRouteRef);
  const navigate = useNavigate();
  const { t } = useAnnouncementsTranslation();

  const onOpen = (event: SyntheticEvent<HTMLButtonElement>) => {
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
            <ListItemText primary={t('announcementsPage.contextMenu.admin')} />
          </MenuItem>
          <MenuItem onClick={() => navigate(categoriesLink())}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('announcementsPage.contextMenu.categories')}
            />
          </MenuItem>
          <MenuItem onClick={() => navigate(tagsLink())}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('announcementsPage.contextMenu.tags')} />
          </MenuItem>
        </MenuList>
      </Popover>
    </Box>
  );
}
