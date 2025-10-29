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
import { useAsync } from 'react-use';

import {
  Content,
  ErrorPage,
  Header,
  Page,
  Progress,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { MemberEntity } from '../../types';
import { RoleForm } from './RoleForm';
import { RoleFormValues } from './types';
import { useTranslation } from '../../hooks/useTranslation';

export const CreateRolePage = () => {
  const rbacApi = useApi(rbacApiRef);
  const { t } = useTranslation();
  const {
    loading: membersLoading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const canReadUsersAndGroups =
    !membersLoading &&
    !membersError &&
    Array.isArray(members) &&
    members.length > 0;

  const initialValues: RoleFormValues = {
    name: '',
    namespace: 'default',
    kind: 'role',
    description: '',
    selectedMembers: [],
    selectedPlugins: [],
    permissionPoliciesRows: [],
  };

  if (membersLoading) {
    return <Progress />;
  }

  return canReadUsersAndGroups ? (
    <Page themeId="tool">
      <Header title={t('page.createRole')} type="RBAC" typeLink=".." />
      <Content>
        <RoleForm
          initialValues={initialValues}
          titles={{
            formTitle: t('roleForm.titles.createRole'),
            nameAndDescriptionTitle: t('roleForm.titles.nameAndDescription'),
            usersAndGroupsTitle: t('roleForm.titles.usersAndGroups'),
            permissionPoliciesTitle: t('roleForm.titles.permissionPolicies'),
          }}
          membersData={{
            members: Array.isArray(members) ? members : ([] as MemberEntity[]),
            loading: membersLoading,
            error: (membersError as unknown as Error) || {
              name: (members as unknown as Response)?.status,
              message: (members as unknown as Response)?.statusText,
            },
          }}
        />
      </Content>
    </Page>
  ) : (
    <ErrorPage statusMessage={t('errors.unauthorized')} />
  );
};
