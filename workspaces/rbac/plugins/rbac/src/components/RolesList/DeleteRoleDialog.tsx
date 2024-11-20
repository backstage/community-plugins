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

import { useApi } from '@backstage/core-plugin-api';

import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RoleBasedPolicy } from '@backstage-community/plugin-rbac-common';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { getMembers } from '../../utils/rbac-utils';
import {
  removeConditions,
  removePermissions,
} from '../../utils/role-form-utils';
import { useToast } from '../ToastContext';

type DeleteRoleDialogProps = {
  open: boolean;
  closeDialog: () => void;
  roleName: string;
  propOptions: {
    memberRefs: string[];
    permissions: number;
  };
};

const DeleteRoleDialog = ({
  open,
  closeDialog,
  roleName,
  propOptions,
}: DeleteRoleDialogProps) => {
  const { setToastMessage } = useToast();
  const [deleteRoleValue, setDeleteRoleValue] = React.useState<string>();
  const [disableDelete, setDisableDelete] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const rbacApi = useApi(rbacApiRef);

  const deleteRole = async () => {
    try {
      const policies = await rbacApi.getAssociatedPolicies(roleName);
      const conditionalPolicies = await rbacApi.getRoleConditions(roleName);

      if (Array.isArray(policies)) {
        const allowedPolicies = policies.filter(
          (policy: RoleBasedPolicy) => policy.effect !== 'deny',
        );
        await removePermissions(roleName, allowedPolicies, rbacApi);
      }

      if (Array.isArray(conditionalPolicies)) {
        const conditionalPoliciesIds = conditionalPolicies.map(cp => cp.id);
        await removeConditions(conditionalPoliciesIds, rbacApi);
      }

      const response = await rbacApi.deleteRole(roleName);
      if (response.status === 200 || response.status === 204) {
        setToastMessage(`Role ${roleName} deleted successfully`);
        closeDialog();
      } else {
        setError(`Unable to delete the role. ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `${err}`);
    }
  };

  const onTextInput = (value: string) => {
    setDeleteRoleValue(value);
    if (value === '') {
      setDisableDelete(true);
    } else if (value === roleName) {
      setDisableDelete(false);
    } else {
      setDisableDelete(true);
    }
  };

  return (
    <Dialog maxWidth="md" open={open} onClose={closeDialog}>
      <DialogTitle id="delete-role" title="Delete Role">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: theme => theme.spacing(1),
          }}
        >
          <Typography component="span" sx={{ fontWeight: 'bold' }}>
            <ErrorIcon
              style={{
                color: 'red',
                alignContent: 'center',
                marginTop: '7px',
                marginBottom: '-3px',
              }}
              fontSize="small"
            />{' '}
            Delete this role?
          </Typography>

          <IconButton
            aria-label="close"
            sx={{
              position: 'absolute',
              right: theme => theme.spacing(1),
              top: theme => theme.spacing(1),
              color: theme => theme.palette.grey[500],
            }}
            onClick={closeDialog}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        Are you sure you want to delete the role{' '}
        <Typography component="span" sx={{ fontWeight: 'bold' }}>
          {roleName}
        </Typography>{' '}
        ?
        <br />
        <br />
        Deleting this role is irreversible and will remove its functionality
        from the system. Proceed with caution.
        <br />
        <br />
        The{' '}
        <Typography component="span" sx={{ fontWeight: 'bold' }}>{`${getMembers(
          propOptions.memberRefs,
        ).toLocaleLowerCase('en-US')}`}</Typography>{' '}
        associated with this role will lose access to all the{' '}
        <Typography
          component="span"
          sx={{ fontWeight: 'bold' }}
        >{`${propOptions.permissions} permission policies`}</Typography>{' '}
        specified in this role.
        <br />
        <TextField
          name="delete-role"
          data-testid="delete-role"
          style={{ marginTop: '24px' }}
          required
          variant="outlined"
          label="Role name"
          defaultValue={deleteRoleValue}
          helperText="Type the name of the role to confirm"
          onChange={({ target: { value } }) => onTextInput(value)}
          onBlur={({ target: { value } }) => onTextInput(value)}
        />
      </DialogContent>
      {error && (
        <Box maxWidth="650px" marginLeft="20px">
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <DialogActions
        style={{
          paddingLeft: '25px',
          paddingBottom: '30px',
          justifyContent: 'left',
          paddingTop: '16px',
        }}
      >
        <Button
          variant="contained"
          style={
            disableDelete || !deleteRoleValue
              ? {}
              : { background: 'red', color: 'white' }
          }
          onClick={deleteRole}
          disabled={disableDelete || !deleteRoleValue}
        >
          Delete
        </Button>
        <Button variant="outlined" onClick={closeDialog}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRoleDialog;
