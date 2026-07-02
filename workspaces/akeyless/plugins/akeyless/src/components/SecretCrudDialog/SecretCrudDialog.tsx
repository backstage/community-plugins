/*
 * Copyright 2025 The Backstage Authors
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

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { useState } from 'react';

export type SecretCrudMode = 'create' | 'edit';

type SecretCrudDialogProps = {
  open: boolean;
  mode: SecretCrudMode;
  contextPath: string;
  secretName?: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (values: { name: string; value: string }) => Promise<void>;
};

export const SecretCrudDialog = ({
  open,
  mode,
  contextPath,
  secretName,
  initialValue = '',
  onClose,
  onSubmit,
}: SecretCrudDialogProps) => {
  const [name, setName] = useState(secretName ?? '');
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleOpen = () => {
    setName(secretName ?? '');
    setValue(initialValue);
    setError(undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onEnter={handleOpen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create static secret' : 'Update static secret'}
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Secret name"
          helperText={
            mode === 'create'
              ? `Relative to ${contextPath} or provide a full path`
              : undefined
          }
          fullWidth
          value={name}
          disabled={mode === 'edit'}
          onChange={event => setName(event.target.value)}
        />
        <TextField
          margin="dense"
          label="Secret value"
          fullWidth
          multiline
          minRows={3}
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        {error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          variant="contained"
          disabled={submitting || !name.trim() || !value}
          onClick={async () => {
            setSubmitting(true);
            setError(undefined);
            try {
              await onSubmit({ name: name.trim(), value });
              onClose();
            } catch (submitError) {
              setError(
                submitError instanceof Error
                  ? submitError.message
                  : 'Failed to save secret',
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
