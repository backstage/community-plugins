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
import { Link, TableColumn } from '@backstage/core-components';

import { MembersData } from '../../types';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { rbacTranslationRef } from '../../translations';

export const getColumns = (
  t: TranslationFunction<typeof rbacTranslationRef.T>,
): TableColumn<MembersData>[] => {
  return [
    {
      title: t('common.name'),
      field: 'name',
      type: 'string',
      render: props => {
        return (
          <Link
            to={`/catalog/${props.ref.namespace}/${props.ref.kind}/${props.ref.name}`}
          >
            {props.name}
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
      render: (props: MembersData) => {
        return props.type === 'User' ? '-' : props.members;
      },
      customSort: (a, b) => {
        if (a.members === 0) {
          return -1;
        }
        if (b.members === 0) {
          return 1;
        }
        if (a.members === b.members) {
          return 0;
        }
        return a.members < b.members ? -1 : 1;
      },
    },
  ];
};
