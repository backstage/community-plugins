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
import React from 'react';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

export const SnackbarAlert = ({
  toastMessage,
  onAlertClose,
}: {
  toastMessage: string;
  onAlertClose: () => void;
}) => {
  return (
    <Snackbar
      open={toastMessage !== ''}
      autoHideDuration={10000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      style={{ top: '100px', left: '0px', justifyContent: 'center' }}
      onClose={onAlertClose}
    >
      <Alert onClose={onAlertClose} severity="success">
        {toastMessage}
      </Alert>
    </Snackbar>
  );
};
