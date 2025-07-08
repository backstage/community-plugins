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

import { IncidentFieldEnum } from '@backstage-community/plugin-servicenow-common';

export type IncidentsData = {
  sysId: string;
  number: string;
  shortDescription: string;
  description: string;
  sysCreatedOn: string;
  priority: number;
  incidentState: number;
  url: string;
};

export type IncidentTableFieldEnumType = Omit<
  typeof IncidentFieldEnum,
  'Description'
>;

export const IncidentTableFieldEnum: IncidentTableFieldEnumType = {
  Created: IncidentFieldEnum.Created,
  IncidentState: IncidentFieldEnum.IncidentState,
  Number: IncidentFieldEnum.Number,
  Priority: IncidentFieldEnum.Priority,
  ShortDescription: IncidentFieldEnum.ShortDescription,
  Url: IncidentFieldEnum.Url,
};

export type IncidentTableField =
  (typeof IncidentTableFieldEnum)[keyof typeof IncidentTableFieldEnum];

export type PaginatedIncidentsData = {
  incidents: IncidentsData[];
  totalCount: number;
};
