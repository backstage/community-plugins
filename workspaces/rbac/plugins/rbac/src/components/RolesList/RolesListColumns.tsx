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

import { parseEntityRef } from '@backstage/catalog-model';
import { Link, TableColumn } from '@backstage/core-components';

import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { RolesData } from '../../types';
import { getMembers } from '../../utils/rbac-utils';
import EditRole from '../EditRole';
import DeleteRole from './DeleteRole';

export const columns: TableColumn<RolesData>[] = [
  {
    title: 'Name',
    field: 'name',
    type: 'string',
    render: (props: RolesData) => {
      const { kind, namespace, name } = parseEntityRef(props.name);
      return (
        <Link to={`roles/${kind}/${namespace}/${name}`}>{props.name}</Link>
      );
    },
  },
  {
    title: 'Users and groups',
    field: 'members',
    type: 'string',
    align: 'left',
    render: props => getMembers(props.members),
    customSort: (a, b) => {
      if (a.members.length === 0) {
        return -1;
      }
      if (b.members.length === 0) {
        return 1;
      }
      if (a.members.length === b.members.length) {
        return 0;
      }
      return a.members.length < b.members.length ? -1 : 1;
    },
  },
  {
    title: 'Accessible plugins',
    field: 'accessiblePlugins',
    type: 'string',
    align: 'left',
    render: (props: RolesData) => {
      const pls = props.accessiblePlugins.map(
        p => p[0].toLocaleUpperCase('en-US') + p.slice(1),
      );
      const plsTooltip = pls.join(', ');
      const plsOverflowCount = pls.length > 2 ? `+ ${pls.length - 2}` : '';

      return pls.length > 0 ? (
        <Tooltip title={plsTooltip || ''} placement="top-start">
          <Typography>
            {pls.length === 1
              ? `${pls[0]}`
              : `${pls[0]}, ${pls[1]} ${plsOverflowCount}`}
          </Typography>
        </Tooltip>
      ) : (
        '-'
      );
    },
  },
  {
    title: 'Actions',
    sorting: false,
    render: (props: RolesData) => (
      <>
        <EditRole
          dataTestId={
            !props.actionsPermissionResults.edit.allowed
              ? `disable-update-role-${props.name}`
              : `update-role-${props.name}`
          }
          roleName={props.name}
          disable={!props.actionsPermissionResults.edit.allowed}
          tooltip={
            !props.actionsPermissionResults.edit.allowed
              ? 'Unauthorized to edit'
              : ''
          }
        />
        <DeleteRole
          dataTestId={
            !props.actionsPermissionResults.delete.allowed
              ? `disable-delete-role-${props.name}`
              : `delete-role-${props.name}`
          }
          roleName={props.name}
          disable={!props.actionsPermissionResults.delete.allowed}
          tooltip={
            !props.actionsPermissionResults.delete.allowed
              ? 'Role cannot be deleted'
              : ''
          }
        />
      </>
    ),
  },
];
