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

import { Link, LinkButton } from '@backstage/core-components';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

export const RolesListToolbar = ({
  createRoleAllowed,
  createRoleLoading,
}: {
  createRoleAllowed: boolean;
  createRoleLoading: boolean;
}) => {
  return (
    <div>
      {!createRoleLoading && !createRoleAllowed && (
        <Alert severity="warning" data-testid="create-role-warning">
          <AlertTitle
            sx={{
              fontWeight: 'bold',
            }}
          >
            Unable to create role.
          </AlertTitle>
          To enable create/edit role button, make sure required users/groups are
          available in catalog as a role cannot be created without users/groups
          and also the role associated with your user should have the permission
          policies mentioned{' '}
          <Link
            to="https://github.com/backstage/community-plugins/tree/main/workspaces/rbac/plugins/rbac#prerequisites"
            target="_blank"
          >
            here
          </Link>
          <Typography sx={{ mt: 1 }} fontSize="small">
            <Typography component="span" fontWeight="bold" fontSize="small">
              Note
            </Typography>
            : Even after ingesting users/groups in catalog and applying above
            permissions if the create/edit button is still disabled then please
            contact your administrator as you might be conditionally restricted
            from accessing the create/edit button.
          </Typography>
        </Alert>
      )}
      <br />
      <Typography
        component="span"
        sx={{
          display: 'flex',
          justifyContent: 'end',
          marginBottom: '24px',
        }}
      >
        <LinkButton
          to="role/new"
          color="primary"
          variant="contained"
          disabled={!createRoleAllowed}
          data-testid="create-role"
        >
          Create
        </LinkButton>
      </Typography>
    </div>
  );
};
