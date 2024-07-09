import React, { forwardRef, ForwardRefRenderFunction } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { WorkflowEditor } from './WorkflowEditor';
import {
  WorkflowEditorRef,
  WorkflowEditorView,
} from './WorkflowEditor/WorkflowEditor';

export type OrchestratorWorkflowDialogProps = {
  workflowId: string;
  title: string;
  open: boolean;
  close: () => void;
  dialogActions?: React.ReactNode;
} & WorkflowEditorView;

const EditorBox = styled(Box)({
  height: '600px',
  marginBottom: 20,
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  right: 8,
  top: 8,
});

export const RefForwardingWorkflowDialog: ForwardRefRenderFunction<
  WorkflowEditorRef,
  OrchestratorWorkflowDialogProps
> = (props, forwardedRef): JSX.Element | null => {
  const { workflowId, title, open, close } = props;

  return (
    <Dialog fullWidth maxWidth="lg" onClose={_ => close()} open={open}>
      <DialogTitle>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <CloseButton aria-label="close" onClick={close}>
            <CloseIcon />
          </CloseButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <EditorBox>
          <WorkflowEditor
            {...props}
            workflowId={workflowId}
            ref={forwardedRef}
          />
        </EditorBox>
      </DialogContent>
      {props.dialogActions}
    </Dialog>
  );
};

export const WorkflowDialog = forwardRef(RefForwardingWorkflowDialog);
