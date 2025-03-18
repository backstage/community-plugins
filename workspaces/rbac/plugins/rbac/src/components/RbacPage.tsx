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

import { Content, Header, Page } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { DeleteDialogContextProvider } from '@janus-idp/shared-react';

import { policyEntityCreatePermission } from '@backstage-community/plugin-rbac-common';

import { RolesList } from './RolesList/RolesList';

export const RbacPage = ({ useHeader = true }: { useHeader?: boolean }) => (
  <RequirePermission
    permission={policyEntityCreatePermission}
    resourceRef={policyEntityCreatePermission.resourceType}
  >
    <Page themeId="tool">
      {useHeader && <Header title="RBAC" />}
      <Content>
        <DeleteDialogContextProvider>
          <RolesList />
        </DeleteDialogContextProvider>
      </Content>
    </Page>
  </RequirePermission>
);
