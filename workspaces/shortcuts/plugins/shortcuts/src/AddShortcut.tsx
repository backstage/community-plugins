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

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import { ShortcutForm } from './ShortcutForm';
import { FormValues, Shortcut } from './types';
import { ShortcutApi } from './api';
import { alertApiRef, useApi, useAnalytics } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 400,
  },
  header: {
    marginBottom: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

type Props = {
  onClose: () => void;
  anchorEl?: Element;
  api: ShortcutApi;

  allowExternalLinks?: boolean;
};

export const AddShortcut = ({
  onClose,
  anchorEl,
  api,
  allowExternalLinks,
}: Props) => {
  const classes = useStyles();
  const alertApi = useApi(alertApiRef);
  const { pathname } = useLocation();
  const [formValues, setFormValues] = useState<FormValues>();
  const open = Boolean(anchorEl);
  const analytics = useAnalytics();

  const handleSave: SubmitHandler<FormValues> = async ({ url, title }) => {
    analytics.captureEvent('click', `Clicked 'Save' in AddShortcut`);
    const shortcut: Omit<Shortcut, 'id'> = { url, title };

    try {
      await api.add(shortcut);
      alertApi.post({
        message: `Added shortcut '${title}' to your sidebar`,
        severity: 'success',
        display: 'transient',
      });
    } catch (error) {
      alertApi.post({
        message: `Could not add shortcut: ${error.message}`,
        severity: 'error',
      });
    }

    onClose();
  };

  const handlePaste = () => {
    setFormValues({ url: pathname, title: document.title });
  };

  const handleClose = () => {
    setFormValues(undefined);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      TransitionProps={{ onExit: handleClose }}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Card className={classes.card}>
        <CardHeader
          className={classes.header}
          title="Add Shortcut"
          titleTypographyProps={{ variant: 'subtitle2' }}
          action={
            <Button
              className={classes.button}
              variant="text"
              size="small"
              color="primary"
              onClick={handlePaste}
            >
              Use current page
            </Button>
          }
        />
        <ShortcutForm
          onClose={handleClose}
          onSave={handleSave}
          formValues={formValues}
          allowExternalLinks={allowExternalLinks}
        />
      </Card>
    </Popover>
  );
};
