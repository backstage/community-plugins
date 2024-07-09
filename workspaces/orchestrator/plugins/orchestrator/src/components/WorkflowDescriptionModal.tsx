import React from 'react';
import { useNavigate } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { WorkflowOverview } from '@backstage-community/plugin-orchestrator-common';

export type WorkflowDescriptionModalProps = {
  workflow: WorkflowOverview;
  runWorkflowLink: string;
  open: boolean;
  onClose?: () => void;
};

export type ParentComponentRef = HTMLElement;

const CloseButton = styled(IconButton)({
  position: 'absolute',
  right: 8,
  top: 8,
});

export const WorkflowDescriptionModal = (
  props: WorkflowDescriptionModalProps,
) => {
  const { workflow, open = false, onClose, runWorkflowLink } = props;
  const navigate = useNavigate();

  const handleRunWorkflow = () => {
    if (runWorkflowLink) {
      navigate(runWorkflowLink);
    }
  };

  return (
    <Dialog onClose={_ => onClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h5">{workflow.name}</Typography>
          <CloseButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {workflow.description ? (
          <DialogContentText>{workflow.description}</DialogContentText>
        ) : (
          <DialogContentText>
            <p>Are you sure you want to run this workflow?</p>
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRunWorkflow} color="primary" variant="contained">
          Run workflow
        </Button>
        <Button onClick={onClose} color="primary" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
