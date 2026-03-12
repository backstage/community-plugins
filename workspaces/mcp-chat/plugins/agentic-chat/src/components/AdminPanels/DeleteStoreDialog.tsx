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
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface DeleteStoreDialogProps {
  deleteConfirm: { storeId: string; storeName: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteStoreDialog = ({
  deleteConfirm,
  onConfirm,
  onCancel,
}: DeleteStoreDialogProps) => (
  <Dialog
    open={deleteConfirm !== null}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle>Delete Vector Store</DialogTitle>
    <DialogContent>
      <Typography variant="body2">
        Delete <strong>{deleteConfirm?.storeName}</strong> and all its files
        permanently?
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button
        color="error"
        variant="contained"
        size="small"
        onClick={onConfirm}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);
