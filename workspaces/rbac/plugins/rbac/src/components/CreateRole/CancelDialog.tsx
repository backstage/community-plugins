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

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';

type CancelDialogProps = {
  open: boolean;
  editForm: boolean;
  closeDialog: () => void;
  navigateTo: () => void;
};

const CancelDialog = ({
  open,
  editForm,
  closeDialog,
  navigateTo,
}: CancelDialogProps) => {
  const dialogBackgroundColor = (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? '#1b1d21' : '#fff';

  return (
    <Dialog maxWidth="md" open={open} onClose={closeDialog}>
      <Box sx={{ backgroundColor: dialogBackgroundColor }}>
        <DialogTitle
          id="cancel-dialog"
          title="Cancel role creation"
          sx={{
            marginBottom: '0 !important',
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              component="span"
              sx={{
                fontWeight: theme => theme.typography.fontWeightBold,
                display: 'flex',
                alignItems: 'center',
                gap: theme => theme.spacing(1),
              }}
            >
              <WarningOutlinedIcon
                sx={{
                  color: '#F0AB00',
                }}
                fontSize="small"
              />{' '}
              {`Exit role ${editForm ? 'editing' : 'creation'}?`}
            </Typography>

            <IconButton
              aria-label="close"
              sx={{
                color: theme => theme.palette.grey[500],
                borderRadius: '50%',
                p: 0,
              }}
              onClick={closeDialog}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          Exiting this page will permanently discard the information you
          entered.
          <br />
          Are you sure you want to exit?
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'left',
            p: 2,
          }}
        >
          <Button variant="contained" onClick={navigateTo}>
            Discard
          </Button>
          <Button variant="outlined" onClick={closeDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CancelDialog;
