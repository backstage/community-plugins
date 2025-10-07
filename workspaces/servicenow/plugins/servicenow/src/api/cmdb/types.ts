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

/** @public */
export type BusinessApplication = {
  sys_id: string;
  name: string;
  u_application_id: string;
  business_criticality: string;
  owned_by: {
    link: string;
    value: string;
  };
  u_delegate: {
    link: string;
    value: string;
  };
  u_support_contact_email: string;
};

/** @public */
export type ServiceNowUser = {
  user_name: string;
  name: string;
  email: string;
};

export type InfraDetails = {
  'parent.sys_class_name': string;
  'parent.name': string;
  u_display: string;
  'child.name': string;
  sys_updated_on: string;
};

export type ServiceNowCMDBResponse = {
  result: [BusinessApplication];
};
export type ServiceNowUserResponse = {
  result: ServiceNowUser;
};

export type ServiceNowInfraResponse = {
  result: [InfraDetails];
};
