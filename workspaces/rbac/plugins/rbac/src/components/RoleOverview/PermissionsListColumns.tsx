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
import { TableColumn } from '@backstage/core-components';

import { PermissionsData } from '../../types';
import { getRulesNumber } from '../../utils/create-role-utils';

export const columns: TableColumn<PermissionsData>[] = [
  {
    title: 'Plugin',
    field: 'plugin',
    type: 'string',
  },
  {
    title: 'Permission',
    field: 'permission',
    type: 'string',
  },
  {
    title: 'Policies',
    field: 'policyString',
    type: 'string',
    customSort: (a, b) => {
      if (a.policies.length === 0) {
        return -1;
      }
      if (b.policies.length === 0) {
        return 1;
      }
      if (a.policies.length === b.policies.length) {
        return 0;
      }
      return a.policies.length < b.policies.length ? -1 : 1;
    },
  },
  {
    title: 'Conditional',
    field: 'conditions',
    type: 'string',
    render: (permissionsData: PermissionsData) => {
      const totalRules = getRulesNumber(permissionsData.conditions);
      return totalRules
        ? `${totalRules} ${totalRules > 1 ? 'rules' : 'rule'}`
        : '-';
    },
  },
];
