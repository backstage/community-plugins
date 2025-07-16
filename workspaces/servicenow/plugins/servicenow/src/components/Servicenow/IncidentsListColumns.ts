/*
 * Copyright 2025 The Backstage Authors
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

import { IncidentsData, IncidentTableFieldEnum } from '../../types';

export const IncidentsListColumns: TableColumn<IncidentsData>[] = [
  {
    id: 'incidentNumber',
    title: 'Incident Number',
    field: IncidentTableFieldEnum.Number,
    type: 'string',
  },
  {
    id: 'description',
    title: 'Description',
    field: IncidentTableFieldEnum.ShortDescription,
    type: 'string',
  },
  {
    id: 'created',
    title: 'Created',
    field: IncidentTableFieldEnum.Created,
    type: 'string',
  },
  {
    id: 'priority',
    title: 'Priority',
    field: IncidentTableFieldEnum.Priority,
    type: 'numeric',
  },
  {
    id: 'state',
    title: 'State',
    field: IncidentTableFieldEnum.IncidentState,
    type: 'datetime',
  },
  {
    id: 'actions',
    title: 'Actions',
    sorting: false,
    type: 'string',
  },
];
