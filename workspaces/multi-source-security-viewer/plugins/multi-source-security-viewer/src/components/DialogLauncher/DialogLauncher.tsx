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
import { ErrorBoundary } from '@backstage/core-components';
import {
  Box,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import type { FC } from 'react';
import { Fragment } from 'react';

type DialogLauncherProps = {
  component: FC<any>;
  componentProps?: Record<string, any>;
  title: string;
  open: boolean;
  onClose: () => void;
} & DialogProps;

export const DialogLauncher: FC<DialogLauncherProps> = ({
  open,
  onClose,
  component: Component,
  componentProps = {},
  title,
  ...rest
}) => {
  return (
    <Fragment>
      <Dialog open={open} onClose={onClose} {...rest}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent={{ xs: 'center', sm: 'space-between' }}
            alignItems="center"
          >
            {title}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <ErrorBoundary>
            <Component {...componentProps} />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
