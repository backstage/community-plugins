/*
 * Copyright 2022 The Backstage Authors
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

import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { ResponseErrorPanel } from '@backstage/core-components';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  useAsyncEntity,
  EntityDisplayName,
} from '@backstage/plugin-catalog-react';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  permissions,
  Playlist,
  PlaylistMetadata,
} from '@backstage-community/plugin-playlist-common';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ClearButton from '@material-ui/icons/Clear';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import SearchIcon from '@material-ui/icons/Search';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAsyncFn from 'react-use/esm/useAsyncFn';

import { playlistApiRef } from '../../api';
import { useTitle } from '../../hooks';
import { playlistRouteRef } from '../../routes';
import { PlaylistEditDialog } from '../PlaylistEditDialog';

const useStyles = makeStyles({
  dialog: {
    height: '50%',
  },
  dialogTitle: {
    paddingBottom: '5px',
  },
  dialogContent: {
    paddingLeft: '5px',
    paddingRight: '5px',
  },
  search: {
    fontSize: '16px',
  },
});

/**
 * @public
 */
export type EntityPlaylistDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const EntityPlaylistDialog = (props: EntityPlaylistDialogProps) => {
  const { open, onClose } = props;

  const classes = useStyles();
  const navigate = useNavigate();
  const { entity } = useAsyncEntity();
  const alertApi = useApi(alertApiRef);
  const playlistApi = useApi(playlistApiRef);
  const playlistRoute = useRouteRef(playlistRouteRef);
  const [search, setSearch] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const { allowed: createAllowed } = usePermission({
    permission: permissions.playlistListCreate,
  });

  const closeDialog = useCallback(() => {
    setSearch('');
    onClose();
  }, [onClose, setSearch]);

  const [{ error, loading, value: playlists }, loadPlaylists] = useAsyncFn(
    () => playlistApi.getAllPlaylists({ editable: true }),
    [playlistApi],
  );

  const singularTitle = useTitle({
    pluralize: true,
    lowerCase: false,
  });
  const singularTitleLowerCase = useTitle({
    pluralize: false,
    lowerCase: true,
  });
  const pluralTitleLowerCase = useTitle({
    pluralize: true,
    lowerCase: true,
  });

  useEffect(() => {
    if (open) {
      loadPlaylists();
    }
  }, [loadPlaylists, open]);

  const createNewPlaylist = useCallback(
    async (playlist: Omit<PlaylistMetadata, 'id'>) => {
      try {
        const playlistId = await playlistApi.createPlaylist(playlist);
        await playlistApi.addPlaylistEntities(playlistId, [
          stringifyEntityRef(entity!),
        ]);
        navigate(playlistRoute({ playlistId }));
        alertApi.post({
          message: `Added playlist '${playlist.name}'`,
          severity: 'success',
          display: 'transient',
        });
      } catch (e) {
        alertApi.post({
          message: `Failed to add entity to ${singularTitleLowerCase}: ${e}`,
          severity: 'error',
        });
      }
    },
    [
      alertApi,
      entity,
      navigate,
      playlistApi,
      playlistRoute,
      singularTitleLowerCase,
    ],
  );

  const [{ loading: addEntityLoading }, addToPlaylist] = useAsyncFn(
    async (playlist: Playlist) => {
      try {
        await playlistApi.addPlaylistEntities(playlist.id, [
          stringifyEntityRef(entity!),
        ]);
        closeDialog();
        alertApi.post({
          message: `Entity added to ${playlist.name}`,
          severity: 'success',
          display: 'transient',
        });
      } catch (e) {
        alertApi.post({
          message: `Failed to add entity to ${singularTitleLowerCase}: ${e}`,
          severity: 'error',
        });
      }
    },
    [alertApi, closeDialog, entity, playlistApi, singularTitleLowerCase],
  );

  return (
    <>
      <Dialog
        classes={{ paper: classes.dialog }}
        fullWidth
        maxWidth="xs"
        onClose={closeDialog}
        open={open}
      >
        {(loading || addEntityLoading) && <LinearProgress />}
        <DialogTitle className={classes.dialogTitle}>
          Add to {singularTitle}
          <TextField
            fullWidth
            data-testid="entity-playlist-dialog-search"
            InputProps={{
              classes: {
                input: classes.search,
              },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearch('')}>
                    <ClearButton fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            margin="dense"
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            size="small"
            value={search}
            variant="outlined"
          />
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {error && (
            <ResponseErrorPanel
              title={`Error loading ${pluralTitleLowerCase}`}
              error={error}
            />
          )}
          {playlists && entity && (
            <List>
              {createAllowed && (
                <ListItem
                  button
                  disabled={addEntityLoading}
                  divider
                  onClick={() => setOpenEditDialog(true)}
                >
                  <ListItemIcon>
                    <PlaylistAddIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Create new ${singularTitleLowerCase}`}
                  />
                </ListItem>
              )}
              {playlists
                .filter(
                  list =>
                    !search ||
                    list.name
                      .toLocaleLowerCase('en-US')
                      .includes(search.toLocaleLowerCase('en-US')),
                )
                .map(list => (
                  <React.Fragment key={list.id}>
                    <ListItem
                      button
                      disabled={addEntityLoading}
                      divider
                      onClick={() => addToPlaylist(list)}
                    >
                      <ListItemText
                        primary={list.name}
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            by{' '}
                            <EntityDisplayName
                              hideIcon
                              disableTooltip
                              defaultKind="group"
                              entityRef={parseEntityRef(list.owner)}
                            />
                            {' · '}
                            {list.entities} entities{' '}
                            {!list.public ? '· Private' : ''}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={closeDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <PlaylistEditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSave={createNewPlaylist}
      />
    </>
  );
};
