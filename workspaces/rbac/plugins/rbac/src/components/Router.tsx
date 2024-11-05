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
import { Route, Routes } from 'react-router-dom';

import { ErrorPage } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { RequirePermission } from '@backstage/plugin-permission-react';

import {
  policyEntityCreatePermission,
  policyEntityUpdatePermission,
} from '@backstage-community/plugin-rbac-common';

import { createRoleRouteRef, editRoleRouteRef, roleRouteRef } from '../routes';
import { CreateRolePage } from './CreateRole/CreateRolePage';
import { EditRolePage } from './CreateRole/EditRolePage';
import { RbacPage } from './RbacPage';
import { RoleOverviewPage } from './RoleOverview/RoleOverviewPage';
import { ToastContextProvider } from './ToastContext';

/**
 *
 * @public
 */
export const Router = ({ useHeader = true }: { useHeader?: boolean }) => {
  const config = useApi(configApiRef);
  const isRBACPluginEnabled = config.getOptionalBoolean('permission.enabled');

  if (!isRBACPluginEnabled) {
    return (
      <ErrorPage
        status="404"
        statusMessage="Enable the RBAC backend plugin to use this feature."
        additionalInfo="To enable RBAC, set `permission.enabled` to `true` in the app-config file."
      />
    );
  }

  return (
    <ToastContextProvider>
      <Routes>
        <Route path="/" element={<RbacPage useHeader={useHeader} />} />
        <Route path={roleRouteRef.path} element={<RoleOverviewPage />} />
        <Route
          path={createRoleRouteRef.path}
          element={
            <RequirePermission
              permission={policyEntityCreatePermission}
              resourceRef={policyEntityCreatePermission.resourceType}
            >
              <CreateRolePage />
            </RequirePermission>
          }
        />
        <Route
          path={editRoleRouteRef.path}
          element={
            <RequirePermission
              permission={policyEntityUpdatePermission}
              resourceRef={policyEntityUpdatePermission.resourceType}
            >
              <EditRolePage />
            </RequirePermission>
          }
        />
      </Routes>
    </ToastContextProvider>
  );
};
