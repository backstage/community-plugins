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
import { useState } from 'react';

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
import { MarkdownContent } from '@backstage/core-components';

import { RoleBasedPolicy } from '@backstage-community/plugin-rbac-common';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { getMembers } from '../../utils/rbac-utils';
import {
  removeConditions,
  removePermissions,
} from '../../utils/role-form-utils';
import { useToast } from '../ToastContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../hooks/useLanguage';

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
  const { t } = useTranslation();
  const locale = useLanguage();
  const [deleteRoleValue, setDeleteRoleValue] = useState<string>();
  const [disableDelete, setDisableDelete] = useState(false);
  const [error, setError] = useState<string>('');

  const rbacApi = useApi(rbacApiRef);

  const dialogBackgroundColor = (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? '#1b1d21' : '#fff';

  const deleteRole = async () => {
    try {
      const policies = await rbacApi.getAssociatedPolicies(roleName);
      const conditionalPolicies = await rbacApi.getRoleConditions(roleName);

      if (Array.isArray(policies)) {
        const allowedPolicies = policies.filter(
          (policy: RoleBasedPolicy) => policy.effect !== 'deny',
        );
        await removePermissions(roleName, allowedPolicies, rbacApi, t);
      }

      if (Array.isArray(conditionalPolicies)) {
        const conditionalPoliciesIds = conditionalPolicies.map(cp => cp.id);
        await removeConditions(conditionalPoliciesIds, rbacApi, t);
      }

      const response = await rbacApi.deleteRole(roleName);
      if (response.status === 200 || response.status === 204) {
        setToastMessage(t('deleteDialog.successMessage' as any, { roleName }));
        closeDialog();
      } else {
        setError(`${t('errors.deleteRole')} ${response.statusText}`);
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

  const content = t('deleteDialog.confirmation' as any, {
    roleName,
    members: getMembers(propOptions.memberRefs, t).toLocaleLowerCase(
      locale ?? 'en',
    ),
    permissions: propOptions.permissions.toString(),
  });

  return (
    <Dialog maxWidth="md" open={open} onClose={closeDialog}>
      <DialogTitle
        id="delete-role"
        title={t('deleteDialog.title')}
        sx={{
          marginBottom: '0 !important',
          backgroundColor: dialogBackgroundColor,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme => theme.spacing(1),
          }}
        >
          <Typography component="span" sx={{ fontWeight: 'bold' }}>
            <ErrorIcon
              style={{
                color: 'red',
                alignContent: 'center',
                marginTop: '7px',
                marginRight: '5px',
                marginBottom: '-3px',
              }}
              fontSize="small"
            />{' '}
            {t('deleteDialog.question')}
          </Typography>

          <IconButton
            aria-label="close"
            sx={{
              padding: '8px !important',
              color: theme => theme.palette.grey[500],
              borderRadius: '50%',
              '&:hover': { borderRadius: '50%' },
            }}
            onClick={closeDialog}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: dialogBackgroundColor }}>
        <MarkdownContent content={content} />
        <br />
        <TextField
          name="delete-role"
          data-testid="delete-role"
          sx={{
            marginTop: '24px',
            backgroundColor: `${dialogBackgroundColor} !important`,
          }}
          required
          variant="outlined"
          label={t('deleteDialog.roleNameLabel')}
          defaultValue={deleteRoleValue}
          helperText={t('deleteDialog.roleNameHelper')}
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
        sx={{
          paddingLeft: '25px',
          paddingBottom: '30px',
          justifyContent: 'left',
          paddingTop: '16px',
          backgroundColor: dialogBackgroundColor,
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
          {t('deleteDialog.deleteButton')}
        </Button>
        <Button variant="outlined" onClick={closeDialog}>
          {t('deleteDialog.cancelButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRoleDialog;
