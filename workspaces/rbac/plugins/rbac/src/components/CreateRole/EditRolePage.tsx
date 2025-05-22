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
import { useParams } from 'react-router-dom';

import {
  Content,
  ErrorPage,
  Header,
  Page,
  Progress,
  useQueryParamState,
} from '@backstage/core-components';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { useSelectedMembers } from '../../hooks/useSelectedMembers';
import { RoleForm } from './RoleForm';
import { RoleFormValues } from './types';
import { capitalizeFirstLetter } from '../../utils/string-utils';

export const EditRolePage = () => {
  const { roleName, roleNamespace, roleKind } = useParams();
  const [queryParamState] = useQueryParamState<number>('activeStep');

  const roleEntityRef = roleName
    ? `${roleKind}:${roleNamespace}/${roleName}`
    : '';

  const {
    selectedMembers,
    members,
    role,
    loading: loadingMembers,
    roleError,
    membersError,
    canReadUsersAndGroups,
  } = useSelectedMembers(roleEntityRef);

  const { rolePolicies, loading: loadingPolicies } =
    usePermissionPolicies(roleEntityRef);

  if (loadingMembers || loadingPolicies) {
    return <Progress />;
  }
  if (roleError.name) {
    return (
      <ErrorPage status={roleError.name} statusMessage={roleError.message} />
    );
  }

  const initialValues: RoleFormValues = {
    name: roleName || '',
    namespace: roleNamespace || 'default',
    kind: roleKind || 'role',
    description: role?.metadata?.description ?? '',
    owner: role?.metadata?.owner ?? '',
    selectedMembers,
    selectedPlugins: rolePolicies
      .map(pp => pp.plugin)
      .filter((p, i, ar) => ar.indexOf(p) === i)
      .map(sp => ({
        label: capitalizeFirstLetter(sp),
        value: sp,
      })),
    permissionPoliciesRows: rolePolicies || [],
  };

  if (!canReadUsersAndGroups) {
    return <ErrorPage statusMessage="Unauthorized to edit role" />;
  }

  return (
    <Page themeId="tool">
      <Header title="Edit role" type="RBAC" typeLink=".." />
      <Content>
        <RoleForm
          initialValues={initialValues}
          titles={{
            formTitle: 'Edit Role',
            nameAndDescriptionTitle: 'Edit name and description of role ',
            usersAndGroupsTitle: 'Edit users and groups',
            permissionPoliciesTitle: 'Edit permission policies',
          }}
          roleName={roleName ? `${roleKind}:${roleNamespace}/${roleName}` : ''}
          step={Number(queryParamState)}
          membersData={{
            members,
            loading: loadingMembers,
            error: membersError,
          }}
          submitLabel="Save"
        />
      </Content>
    </Page>
  );
};
