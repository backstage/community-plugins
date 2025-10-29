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
import { Table } from '@backstage/core-components';

import Box from '@mui/material/Box';
import { FormikErrors } from 'formik';

import { getMembers } from '../../utils/rbac-utils';
import { selectedMembersColumns } from './AddedMembersTableColumn';
import { RoleFormValues, SelectedMember } from './types';
import { useTranslation } from '../../hooks/useTranslation';

type AddedMembersTableProps = {
  selectedMembers: SelectedMember[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>;
};

export const AddedMembersTable = ({
  selectedMembers,
  setFieldValue,
}: AddedMembersTableProps) => {
  const { t } = useTranslation();

  return (
    <Table
      title={
        selectedMembers.length > 0
          ? `${getMembers(selectedMembers, t)}`
          : t('common.noUsersAndGroupsSelected')
      }
      data={selectedMembers}
      columns={selectedMembersColumns(selectedMembers, setFieldValue, t)}
      emptyContent={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          {t('common.selectedUsersAndGroupsAppearHere')}
        </Box>
      }
      options={{ emptyRowsWhenPaging: false }}
      localization={{
        toolbar: { searchPlaceholder: t('table.searchPlaceholder') },
        pagination: { labelRowsSelect: t('table.labelRowsSelect') },
      }}
    />
  );
};
