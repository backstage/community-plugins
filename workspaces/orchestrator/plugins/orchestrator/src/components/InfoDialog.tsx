import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export type InfoDialogProps = {
  title: string;
  open: boolean;
  onClose?: () => void;
  dialogActions?: React.ReactNode;
  children?: React.ReactNode;
};

const CloseButton = styled(IconButton)({
  position: 'absolute',
  right: 8,
  top: 8,
});

export const InfoDialog = (props: InfoDialogProps) => {
  const { title, open = false, onClose, children, dialogActions } = props;

  return (
    <Dialog onClose={_ => onClose} open={open}>
      <DialogTitle>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <CloseButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>{dialogActions}</DialogActions>
    </Dialog>
  );
};
