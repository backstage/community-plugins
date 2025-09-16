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

import { BusinessApplication } from '../../../api/cmdb/types';

export const mockService: BusinessApplication = {
  sys_id: '',
  name: 'Test Application',
  u_application_id: 'APP-001',
  business_criticality: 'C1',
  owned_by: {
    link: '#',
    value: 'testuuid',
  },
  u_delegate: {
    link: '#',
    value: 'testuuid2',
  },
  u_support_contact_email: 'mail@example.com',
};
