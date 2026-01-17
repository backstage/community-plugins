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
import { useState, useEffect, SyntheticEvent } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface ErrorSnackbarProps {
  error: Error | null | unknown;
}

export const ErrorSnackbar = ({ error }: ErrorSnackbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setIsOpen(true);
    }
  }, [error]);

  const handleClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
  };

  if (!error) {
    return null;
  }

  // Accommodate the custom 'details' property while providing fallbacks
  const errorMessage =
    // @ts-ignore
    (error as any)?.error ||
    (error as Error)?.message ||
    'An unknown error occurred.';

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
};
