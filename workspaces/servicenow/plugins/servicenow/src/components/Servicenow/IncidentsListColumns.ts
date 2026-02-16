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
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Hook to get translated incidents list columns
 */
export const useIncidentsListColumns = (): TableColumn<IncidentsData>[] => {
  const { t } = useTranslation();

  return [
    {
      id: 'incidentNumber',
      title: t('table.columns.incidentNumber'),
      field: IncidentTableFieldEnum.Number,
      type: 'string',
    },
    {
      id: 'description',
      title: t('table.columns.description'),
      field: IncidentTableFieldEnum.ShortDescription,
      type: 'string',
    },
    {
      id: 'created',
      title: t('table.columns.created'),
      field: IncidentTableFieldEnum.Created,
      type: 'string',
    },
    {
      id: 'priority',
      title: t('table.columns.priority'),
      field: IncidentTableFieldEnum.Priority,
      type: 'numeric',
    },
    {
      id: 'state',
      title: t('table.columns.state'),
      field: IncidentTableFieldEnum.IncidentState,
      type: 'datetime',
    },
    {
      id: 'actions',
      title: t('table.columns.actions'),
      sorting: false,
      type: 'string',
    },
  ];
};

/**
 * @deprecated Use useIncidentsListColumns hook instead
 */
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
