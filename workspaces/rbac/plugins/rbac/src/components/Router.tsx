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
import { Route, Routes } from 'react-router-dom';

import { ErrorPage } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { policyEntityCreatePermission } from '@backstage-community/plugin-rbac-common';

// TODO: Migrate this to NFS, probably by having two different Routers.
import {
  createRoleRouteRef,
  editRoleRouteRef,
  roleRouteRef,
} from '../legacy/routes';
import { CreateRolePage } from './CreateRole/CreateRolePage';
import { EditRolePage } from './CreateRole/EditRolePage';
import { RbacPage } from './RbacPage';
import { RoleOverviewPage } from './RoleOverview/RoleOverviewPage';
import { ToastContextProvider } from './ToastContext';
import { useTranslation } from '../hooks/useTranslation';
import { HeaderVariant } from './RolePageLayout';

const RbacRoutes = ({
  useHeader,
  headerVariant,
}: {
  useHeader: boolean;
  headerVariant: HeaderVariant;
}) => {
  const config = useApi(configApiRef);
  const { t } = useTranslation();
  const isRBACPluginEnabled = config.getOptionalBoolean('permission.enabled');

  if (!isRBACPluginEnabled) {
    return (
      <ErrorPage
        status="404"
        statusMessage={t('errors.rbacDisabled')}
        additionalInfo={t('errors.rbacDisabledInfo')}
      />
    );
  }

  return (
    <ToastContextProvider>
      <Routes>
        <Route path="/" element={<RbacPage useHeader={useHeader} />} />
        <Route
          path={roleRouteRef.path}
          element={<RoleOverviewPage headerVariant={headerVariant} />}
        />
        <Route
          path={createRoleRouteRef.path}
          element={
            <RequirePermission permission={policyEntityCreatePermission}>
              <CreateRolePage headerVariant={headerVariant} />
            </RequirePermission>
          }
        />
        <Route
          path={editRoleRouteRef.path}
          element={<EditRolePage headerVariant={headerVariant} />}
        />
      </Routes>
    </ToastContextProvider>
  );
};

/**
 *
 * @public
 */
export const Router = ({ useHeader = true }: { useHeader?: boolean }) => (
  <RbacRoutes useHeader={useHeader} headerVariant="legacy" />
);

export const NfsRouter = () => (
  <RbacRoutes useHeader={false} headerVariant="bui" />
);
