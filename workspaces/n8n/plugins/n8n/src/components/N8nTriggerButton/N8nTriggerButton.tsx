/*
 * Copyright 2026 The Backstage Authors
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

import { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { n8nApiRef } from '../../api';

/** @public */
export const N8nTriggerButton = (props: {
  workflowId: string;
  workflowName?: string;
  onTriggered?: () => void;
}) => {
  const { workflowId, workflowName, onTriggered } = props;
  const api = useApi(n8nApiRef);
  const alertApi = useApi(alertApiRef);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await api.activateWorkflow(workflowId);
      alertApi.post({
        message: `Workflow "${
          workflowName ?? workflowId
        }" activated successfully`,
        severity: 'success',
      });
      onTriggered?.();
    } catch (err) {
      alertApi.post({
        message: `Failed to activate workflow: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<PlayArrowIcon />}
        onClick={() => setOpen(true)}
      >
        Activate
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Activate Workflow</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to activate the workflow "
            {workflowName ?? workflowId}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="default">
            Cancel
          </Button>
          <Button onClick={handleTrigger} color="primary" disabled={loading}>
            {loading ? 'Activating...' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
