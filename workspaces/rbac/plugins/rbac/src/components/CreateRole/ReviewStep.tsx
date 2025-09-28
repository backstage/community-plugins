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
import { StructuredMetadataTable } from '@backstage/core-components';

import Typography from '@mui/material/Typography';

import { getPermissionsNumber } from '../../utils/create-role-utils';
import { getMembers } from '../../utils/rbac-utils';
import { reviewStepMemebersTableColumns } from './AddedMembersTableColumn';
import { ReviewStepTable } from './ReviewStepTable';
import { selectedPermissionPoliciesColumn } from './SelectedPermissionPoliciesColumn';
import { RoleFormValues } from './types';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { rbacTranslationRef } from '../../translations';

const tableMetadata = (
  values: RoleFormValues,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => {
  const membersKey =
    values.selectedMembers.length > 0
      ? `${t('table.headers.usersAndGroups')} (${getMembers(values.selectedMembers, t)})`
      : t('table.headers.usersAndGroups');
  const permissionPoliciesKey = `Permission policies (${getPermissionsNumber(
    values,
  )})`;
  return {
    [t('roleForm.review.nameDescriptionOwner')]: (
      <>
        <Typography sx={{ margin: '0px' }}>{values.name}</Typography>
        <br />
        <Typography sx={{ margin: '0px' }}>
          {values.description || '-'}
        </Typography>
        <br />
        <Typography sx={{ margin: '0px' }}>{values.owner || '-'}</Typography>
      </>
    ),
    [membersKey]: (
      <ReviewStepTable
        rows={values.selectedMembers}
        columns={reviewStepMemebersTableColumns(t)}
        tableWrapperWidth={550}
      />
    ),
    [permissionPoliciesKey]: (
      <ReviewStepTable
        rows={values.permissionPoliciesRows}
        columns={selectedPermissionPoliciesColumn(t)}
        tableWrapperWidth={700}
      />
    ),
  };
};

export const ReviewStep = ({
  values,
  isEditing,
}: {
  values: RoleFormValues;
  isEditing: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <div style={{ overflow: 'auto' }}>
      <Typography variant="h6">
        {isEditing
          ? t('roleForm.review.reviewAndSave')
          : t('roleForm.review.reviewAndCreate')}
      </Typography>
      <StructuredMetadataTable
        dense
        metadata={tableMetadata(values, t)}
        options={{ titleFormat: (key: string) => key }}
      />
    </div>
  );
};
