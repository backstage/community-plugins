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
import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

export const servicenowMessages = {
  page: {
    title: 'ServiceNow tickets',
    titleWithCount: 'ServiceNow tickets ({{count}})',
  },
  table: {
    searchPlaceholder: 'Search',
    labelRowsSelect: '{{count}} rows',
    columns: {
      incidentNumber: 'Incident Number',
      description: 'Description',
      created: 'Created',
      priority: 'Priority',
      state: 'State',
      actions: 'Actions',
    },
    emptyContent: 'No records found',
  },
  filter: {
    state: 'State',
    priority: 'Priority',
  },
  priority: {
    critical: 'Critical',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    planning: 'Planning',
  },
  incidentState: {
    new: 'New',
    inProgress: 'In Progress',
    onHold: 'On Hold',
    resolved: 'Resolved',
    closed: 'Closed',
    cancelled: 'Cancelled',
  },
  errors: {
    loadingIncidents: 'Error loading incidents: {{error}}',
  },
  actions: {
    openInServicenow: 'Open in ServiceNow',
  },
};

/**
 * Translation reference for the ServiceNow plugin.
 * @alpha
 */
export const servicenowTranslationRef = createTranslationRef({
  id: 'plugin.servicenow',
  messages: servicenowMessages,
});
