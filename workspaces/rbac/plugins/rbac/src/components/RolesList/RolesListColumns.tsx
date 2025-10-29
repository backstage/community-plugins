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

import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { RolesData } from '../../types';
import { getMembers } from '../../utils/rbac-utils';
import EditRole from '../EditRole';
import DeleteRole from './DeleteRole';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { rbacTranslationRef } from '../../translations';

export const getColumns = (
  t: TranslationFunction<typeof rbacTranslationRef.T>,
  locale: string,
): TableColumn<RolesData>[] => {
  return [
    {
      title: t('table.headers.name'),
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
      title: t('table.headers.usersAndGroups'),
      field: 'members',
      type: 'string',
      align: 'left',
      render: props => getMembers(props.members, t),
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
      title: t('table.headers.accessiblePlugins'),
      field: 'accessiblePlugins',
      type: 'string',
      align: 'left',
      render: (props: RolesData) => {
        const pls = props.accessiblePlugins.map(
          p => p[0].toLocaleUpperCase(locale) + p.slice(1),
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
      title: t('table.headers.actions'),
      sorting: false,
      render: (props: RolesData) => (
        <>
          <EditRole
            canEdit={props.actionsPermissionResults.edit.allowed}
            roleName={props.name}
          />
          <DeleteRole
            canEdit={props.actionsPermissionResults.edit.allowed}
            roleName={props.name}
          />
        </>
      ),
    },
  ];
};
