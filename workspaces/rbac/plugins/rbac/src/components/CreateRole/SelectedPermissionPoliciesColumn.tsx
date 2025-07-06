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
import { getRulesNumber } from '../../utils/create-role-utils';
import { getPolicyString } from '../../utils/rbac-utils';
import { ConditionsData } from '../ConditionalAccess/types';
import { RowPolicy } from './types';

export const selectedPermissionPoliciesColumn = () => [
  {
    title: 'Plugin',
    field: 'plugin',
  },
  {
    title: 'Permission',
    field: 'permission',
  },
  {
    title: 'Policies',
    field: 'policies',
    render: (policies: RowPolicy[]) => getPolicyString(policies),
  },
  {
    title: 'Conditional',
    field: 'conditions',
    render: (conditions: ConditionsData) => {
      const totalRules = getRulesNumber(conditions);
      return totalRules
        ? `${totalRules} ${totalRules > 1 ? 'rules' : 'rule'}`
        : '-';
    },
  },
];
