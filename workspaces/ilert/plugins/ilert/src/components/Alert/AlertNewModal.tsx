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
import { DEFAULT_NAMESPACE, parseEntityRef } from '@backstage/catalog-model';
import {
  alertApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Alert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';
import { ilertApiRef } from '../../api';
import { useNewAlert } from '../../hooks/useNewAlert';
import { AlertSource } from '../../types';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    minWidth: 120,
    width: '100%',
  },
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
  optionWrapper: {
    display: 'flex',
    width: '100%',
  },
  sourceImage: {
    height: 22,
    paddingRight: 4,
  },
}));

export const AlertNewModal = ({
  isModalOpened,
  setIsModalOpened,
  refetchAlerts,
  initialAlertSource,
  entityName,
}: {
  isModalOpened: boolean;
  setIsModalOpened: (open: boolean) => void;
  refetchAlerts: () => void;
  initialAlertSource?: AlertSource | null;
  entityName?: string;
}) => {
  const [
    { alertSources, alertSource, summary, details, isLoading },
    { setAlertSource, setSummary, setDetails, setIsLoading },
  ] = useNewAlert(isModalOpened, initialAlertSource);
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(alertApiRef);
  const identityApi = useApi(identityApiRef);
  const source = window.location.toString();
  const classes = useStyles();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const handleClose = () => {
    setIsModalOpened(false);
  };

  let integrationKey = '';
  if (initialAlertSource && initialAlertSource.integrationKey) {
    integrationKey = initialAlertSource.integrationKey;
  } else if (alertSource && alertSource.integrationKey) {
    integrationKey = alertSource.integrationKey;
  }
  const handleCreate = () => {
    if (!integrationKey) {
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const { userEntityRef } = await identityApi.getBackstageIdentity();
        const { name: userName } = parseEntityRef(userEntityRef, {
          defaultKind: 'User',
          defaultNamespace: DEFAULT_NAMESPACE,
        });
        await ilertApi.createAlert({
          integrationKey,
          summary,
          details,
          userName,
          source,
        });
        alertApi.post({ message: 'Alert created.' });
        refetchAlerts();
      } catch (err) {
        alertApi.post({ message: err, severity: 'error' });
      }
      setIsModalOpened(false);
    }, 250);
  };

  const canCreate = !!integrationKey && !!summary;

  return (
    <Dialog
      open={isModalOpened}
      onClose={handleClose}
      aria-labelledby="create-alert-form-title"
    >
      <DialogTitle id="create-alert-form-title">
        {entityName ? (
          <div>
            This action will trigger an alert for{' '}
            <strong>"{entityName}"</strong>.
          </div>
        ) : (
          'New alert'
        )}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info">
          <Typography variant="body1" gutterBottom align="justify">
            Please describe the problem you want to report. Be as descriptive as
            possible. Your signed in user and a reference to the current page
            will automatically be amended to the alarm so that the receiver can
            reach out to you if necessary.
          </Typography>
        </Alert>
        {!initialAlertSource ? (
          <Autocomplete
            disabled={isLoading}
            options={alertSources}
            value={alertSource}
            classes={{
              root: classes.formControl,
              option: classes.option,
            }}
            onChange={(_event: any, newValue: any) => {
              setAlertSource(newValue);
            }}
            autoHighlight
            getOptionLabel={a => a.name}
            renderOption={a => (
              <div className={classes.optionWrapper}>
                <img
                  src={prefersDarkMode ? a.lightIconUrl : a.iconUrl}
                  alt={a.name}
                  className={classes.sourceImage}
                />
                <Typography noWrap>{a.name}</Typography>
              </div>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label="Alert Source"
                variant="outlined"
                margin="normal"
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password', // disable autocomplete and autofill
                }}
              />
            )}
          />
        ) : null}
        <TextField
          disabled={isLoading}
          label="Summary"
          fullWidth
          margin="normal"
          variant="outlined"
          classes={{
            root: classes.formControl,
          }}
          value={summary}
          onChange={event => {
            setSummary(event.target.value);
          }}
        />
        <TextField
          disabled={isLoading}
          label="Details"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          variant="outlined"
          classes={{
            root: classes.formControl,
          }}
          value={details}
          onChange={event => {
            setDetails(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!canCreate}
          onClick={handleCreate}
          color="secondary"
          variant="contained"
        >
          Create
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
