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

import { SubmitHandler } from 'react-hook-form';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import { ShortcutForm } from './ShortcutForm';
import { FormValues, Shortcut } from './types';
import DeleteIcon from '@material-ui/icons/Delete';
import { ShortcutApi } from './api';
import { useApi, useAnalytics } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const useStyles = makeStyles(theme => ({
  card: {
    width: 400,
  },
  header: {
    marginBottom: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

type Props = {
  shortcut: Shortcut;
  onClose: () => void;
  anchorEl?: Element;
  api: ShortcutApi;
  allowExternalLinks?: boolean;
};

export const EditShortcut = ({
  shortcut,
  onClose,
  anchorEl,
  api,
  allowExternalLinks,
}: Props) => {
  const classes = useStyles();
  const toastApi = useApi(toastApiRef);
  const open = Boolean(anchorEl);
  const analytics = useAnalytics();

  const handleSave: SubmitHandler<FormValues> = async ({ url, title }) => {
    analytics.captureEvent('click', `Clicked 'Save' in Edit Shortcut`);
    const newShortcut: Shortcut = {
      ...shortcut,
      url,
      title,
    };

    try {
      await api.update(newShortcut);
      toastApi.post({
        title: `Updated shortcut '${title}'`,
        status: 'success',
        timeout: 5000,
      });
    } catch (error) {
      toastApi.post({
        title: `Could not update shortcut: ${error.message}`,
        status: 'danger',
      });
    }

    onClose();
  };

  const handleRemove = async () => {
    analytics.captureEvent('click', `Clicked 'Remove' in Edit Shortcut`);

    try {
      await api.remove(shortcut.id);
      toastApi.post({
        title: `Removed shortcut '${shortcut.title}' from your sidebar`,
        status: 'success',
        timeout: 5000,
      });
    } catch (error) {
      toastApi.post({
        title: `Could not delete shortcut: ${error.message}`,
        status: 'danger',
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Card className={classes.card}>
        <CardHeader
          className={classes.header}
          title="Edit Shortcut"
          titleTypographyProps={{ variant: 'subtitle2' }}
          action={
            <Button
              className={classes.button}
              variant="text"
              size="small"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleRemove}
            >
              Remove
            </Button>
          }
        />
        <ShortcutForm
          formValues={{ url: shortcut.url, title: shortcut.title }}
          onClose={handleClose}
          onSave={handleSave}
          allowExternalLinks={allowExternalLinks}
        />
      </Card>
    </Popover>
  );
};
