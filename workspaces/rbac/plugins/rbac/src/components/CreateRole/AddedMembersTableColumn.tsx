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
import { parseEntityRef } from '@backstage/catalog-model';
import { Link, TableColumn } from '@backstage/core-components';

import Delete from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { FormikErrors } from 'formik';

import { RoleFormValues, SelectedMember } from './types';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { rbacTranslationRef } from '../../translations';

export const reviewStepMemebersTableColumns = (
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => {
  return [
    {
      title: t('common.name'),
      field: 'label',
      type: 'string',
    },
    {
      title: t('common.type'),
      field: 'type',
      type: 'string',
    },
    {
      title: t('common.members'),
      field: 'members',
      type: 'numeric',
      align: 'left',
      render: (mem: number) => {
        if (mem || mem === 0) return mem;
        return '-';
      },
    },
  ];
};

export const selectedMembersColumns = (
  selectedMembers: SelectedMember[],
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
): TableColumn<SelectedMember>[] => {
  const onRemove = (etag: string) => {
    const updatedMembers = selectedMembers.filter(
      (mem: SelectedMember) => mem.etag !== etag,
    );
    setFieldValue('selectedMembers', updatedMembers);
  };

  return [
    {
      title: t('common.name'),
      field: 'label',
      type: 'string',
      render: props => {
        const { kind, namespace, name } = parseEntityRef(props.ref);
        return (
          <Link to={`/catalog/${namespace}/${kind}/${name}`} target="blank">
            {props.label}
          </Link>
        );
      },
    },
    {
      title: t('common.type'),
      field: 'type',
      type: 'string',
    },
    {
      title: t('common.members'),
      field: 'members',
      type: 'numeric',
      align: 'left',
      emptyValue: '-',
    },
    {
      title: t('common.actions'),
      sorting: false,
      render: (mem: SelectedMember) => {
        return (
          <Box key={mem.etag}>
            <IconButton
              onClick={() => onRemove(mem.etag)}
              aria-label={t('common.remove')}
              title={t('common.removeMember')}
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              sx={{ '&:hover': { borderRadius: '50%' } }}
            >
              <Delete />
            </IconButton>
          </Box>
        );
      },
    },
  ];
};
