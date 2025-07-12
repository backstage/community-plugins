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

import { IncidentPick } from '@backstage-community/plugin-servicenow-common';

export const mockRawIncidentApiData: (IncidentPick & {
  caller_id?: string;
  opened_by?: string;
  assigned_to?: string;
  u_backstage_entity_id?: string;
})[] = [
  {
    sys_id: 'sys-001',
    number: 'INC0001001',
    short_description: 'Email server unreachable',
    description: 'Cannot reach email server from internal network.',
    sys_created_on: '2024-07-10 08:00:00',
    priority: 1,
    incident_state: 1,
    url: '',
    caller_id: 'user-sys-id-1',
    opened_by: 'user-sys-id-2',
    assigned_to: 'user-sys-id-1',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-002',
    number: 'INC0001002',
    short_description: 'VPN connection drops',
    description: 'VPN disconnects every 5 minutes.',
    sys_created_on: '2024-07-09 14:45:00',
    priority: 2,
    incident_state: 2,
    url: '',
    caller_id: 'user-sys-id-2',
    opened_by: 'user-sys-id-1',
    assigned_to: 'user-sys-id-3',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-003',
    number: 'INC0001003',
    short_description: 'Password reset not working',
    description: 'Password reset link expired.',
    sys_created_on: '2024-07-08 09:30:00',
    priority: 3,
    incident_state: 3,
    url: '',
    caller_id: 'user-sys-id-3',
    opened_by: 'user-sys-id-2',
    assigned_to: 'user-sys-id-1',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-004',
    number: 'INC0001004',
    short_description: 'WiFi slow on 2nd floor',
    description: 'Connection speed drops below 1Mbps.',
    sys_created_on: '2024-07-07 12:00:00',
    priority: 4,
    incident_state: 6,
    url: '',
    caller_id: 'user-sys-id-1',
    opened_by: 'user-sys-id-3',
    assigned_to: 'user-sys-id-2',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-005',
    number: 'INC0001005',
    short_description: 'System crash after update',
    description: 'Desktop app crashes immediately after login.',
    sys_created_on: '2024-07-06 16:00:00',
    priority: 5,
    incident_state: 6,
    url: '',
    caller_id: 'user-sys-id-2',
    opened_by: 'user-sys-id-3',
    assigned_to: 'user-sys-id-1',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-006',
    number: 'INC0001006',
    short_description: 'Unable to print',
    description: 'Printer not responding on floor 3.',
    sys_created_on: '2024-07-05 10:15:00',
    priority: 3,
    incident_state: 6,
    url: '',
    caller_id: 'user-sys-id-3',
    opened_by: 'user-sys-id-2',
    assigned_to: 'user-sys-id-2',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-007',
    number: 'INC0001007',
    short_description: 'Database access error',
    description: 'Permission denied when connecting to DB.',
    sys_created_on: '2024-07-04 11:20:00',
    priority: 2,
    incident_state: 7,
    url: '',
    caller_id: 'user-sys-id-1',
    opened_by: 'user-sys-id-1',
    assigned_to: 'user-sys-id-1',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-008',
    number: 'INC0001008',
    short_description: 'Slack notifications delayed',
    description: 'Slack notifications appear 15 mins late.',
    sys_created_on: '2024-07-03 09:00:00',
    priority: 1,
    incident_state: 8,
    url: '',
    caller_id: 'user-sys-id-1',
    opened_by: 'user-sys-id-3',
    assigned_to: 'user-sys-id-3',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-009',
    number: 'INC0001009',
    short_description: 'Camera not detected',
    description: 'Built-in webcam not working after Windows update.',
    sys_created_on: '2024-07-02 17:40:00',
    priority: 4,
    incident_state: 1,
    url: '',
    caller_id: 'user-sys-id-2',
    opened_by: 'user-sys-id-3',
    assigned_to: 'user-sys-id-2',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
  {
    sys_id: 'sys-010',
    number: 'INC0001010',
    short_description: 'Unable to login',
    description: 'User cannot log in after enabling 2FA.',
    sys_created_on: '2024-07-01 08:00:00',
    priority: 2,
    incident_state: 2,
    url: '',
    caller_id: 'user-sys-id-3',
    opened_by: 'user-sys-id-1',
    assigned_to: 'user-sys-id-3',
    u_backstage_entity_id: 'website-for-my-nice-service',
  },
];
