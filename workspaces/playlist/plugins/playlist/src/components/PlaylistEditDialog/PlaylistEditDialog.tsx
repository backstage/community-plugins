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

import { parseEntityRef } from '@backstage/catalog-model';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { humanizeEntityRef } from '@backstage/plugin-catalog-react';
import { PlaylistMetadata } from '@backstage-community/plugin-playlist-common';
import { playlistApiRef } from '../../api';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import LinearProgress from '@material-ui/core/LinearProgress';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import useAsync from 'react-use/esm/useAsync';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { useTitle } from '../../hooks';

const useStyles = makeStyles({
  buttonWrapper: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

export type PlaylistEditDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (playlist: Omit<PlaylistMetadata, 'id'>) => Promise<void>;
  playlist?: Omit<PlaylistMetadata, 'id'>;
};

export const PlaylistEditDialog = ({
  open,
  onClose,
  onSave,
  playlist = {
    name: '',
    description: '',
    owner: '',
    public: false,
  },
}: PlaylistEditDialogProps) => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const playlistApi = useApi(playlistApiRef);
  const [playlistPromise] = useState(() =>
    playlistApi.getAllPlaylists({}).catch(() => {
      // We ensure that this promise never can throw, to make its usage simpler in the code below
      return [];
    }),
  );

  const { loading: loadingOwnership, value: ownershipRefs } =
    useAsync(async () => {
      const { ownershipEntityRefs } = await identityApi.getBackstageIdentity();
      return ownershipEntityRefs;
    }, []);

  const nameIsUnique = async (name: string) => {
    const playlists = await playlistPromise;
    if (name !== playlist.name && playlists.some(p => p.name === name)) {
      return 'A playlist with this name already exists';
    }

    return true;
  };

  const defaultValues = {
    ...playlist,
    public: playlist.public.toString(),
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({ defaultValues });

  const [saving, savePlaylist] = useAsyncFn(
    formValues =>
      onSave({ ...formValues, public: JSON.parse(formValues.public) }),
    [onSave],
  );

  const closeDialog = () => {
    if (!saving.loading) {
      onClose();
      reset(defaultValues);
    }
  };

  const titleSingularLowerCase = useTitle({
    pluralize: false,
    lowerCase: false,
  });

  return (
    <Dialog fullWidth maxWidth="xs" onClose={closeDialog} open={open}>
      <DialogContent>
        <Controller
          name="name"
          control={control}
          rules={{
            required: true,
            validate: value => nameIsUnique(value),
          }}
          render={({ field }) => (
            <TextField
              {...field}
              disabled={saving.loading}
              data-testid="edit-dialog-name-input"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              label="Name"
              margin="dense"
              placeholder={`Give your ${titleSingularLowerCase} a name`}
              required
              type="text"
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              disabled={saving.loading}
              data-testid="edit-dialog-description-input"
              fullWidth
              label="Description"
              margin="dense"
              multiline
              placeholder={`Describe your ${titleSingularLowerCase}`}
              type="text"
            />
          )}
        />
        {loadingOwnership ? (
          <LinearProgress />
        ) : (
          <Controller
            name="owner"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl
                disabled={saving.loading}
                error={!!errors.owner}
                fullWidth
                required
                margin="dense"
              >
                <InputLabel>Owner</InputLabel>
                <Select {...field} data-testid="edit-dialog-owner-select">
                  {ownershipRefs?.map(ref => (
                    <MenuItem key={ref} value={ref}>
                      {humanizeEntityRef(parseEntityRef(ref), {
                        defaultKind: 'group',
                      })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        )}
        <Controller
          name="public"
          control={control}
          render={({ field }) => (
            <FormControl disabled={saving.loading} margin="dense">
              <RadioGroup {...field} row>
                <FormControlLabel
                  value="false"
                  label="Private"
                  control={<Radio data-testid="edit-dialog-private-option" />}
                />
                <FormControlLabel
                  value="true"
                  label="Public"
                  control={<Radio data-testid="edit-dialog-public-option" />}
                />
              </RadioGroup>
            </FormControl>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" disabled={saving.loading} onClick={closeDialog}>
          Cancel
        </Button>
        <div className={classes.buttonWrapper}>
          <Button
            color="primary"
            disabled={saving.loading}
            onClick={handleSubmit(savePlaylist)}
            data-testid="edit-dialog-save-button"
          >
            Save
          </Button>
          {saving.loading && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
};
