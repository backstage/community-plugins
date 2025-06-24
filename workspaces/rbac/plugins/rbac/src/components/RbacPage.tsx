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
import { Content, Header, Page, Progress } from '@backstage/core-components';

import { RolesList } from './RolesList/RolesList';
import { useApi } from '@backstage/core-plugin-api';
import { rbacApiRef } from '../api/RBACBackendClient';
import { useAsync } from 'react-use';
import { ErrorPage } from '@backstage/core-components';
import { DeleteDialogContextProvider } from './DeleteDialogContext';

export const RbacPage = ({ useHeader = true }: { useHeader?: boolean }) => {
  const rbacApi = useApi(rbacApiRef);
  const { loading: isUserLoading, value: result } = useAsync(
    async () => await rbacApi.getUserAuthorization(),
    [],
  );

  if (!isUserLoading) {
    return result?.status === 'Authorized' ? (
      <Page themeId="tool">
        {useHeader && <Header title="RBAC" />}
        <Content>
          <DeleteDialogContextProvider>
            <RolesList />
          </DeleteDialogContextProvider>
        </Content>
      </Page>
    ) : (
      <ErrorPage statusMessage="Not Found" />
    );
  }
  return <Progress />;
};
