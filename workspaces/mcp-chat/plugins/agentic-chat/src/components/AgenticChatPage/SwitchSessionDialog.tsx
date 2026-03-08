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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export interface SwitchSessionDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SwitchSessionDialog = ({
  open,
  onConfirm,
  onCancel,
}: SwitchSessionDialogProps) => (
  <Dialog open={open} onClose={onCancel} aria-labelledby="switch-dialog-title">
    <DialogTitle id="switch-dialog-title">Message in Progress</DialogTitle>
    <DialogContent>
      <DialogContentText>
        A response is currently being generated. Switching conversations will
        cancel the in-progress response. Continue?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Stay</Button>
      <Button onClick={onConfirm} color="warning" variant="contained">
        Switch Anyway
      </Button>
    </DialogActions>
  </Dialog>
);
