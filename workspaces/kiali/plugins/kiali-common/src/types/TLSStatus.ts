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
export enum MTLSStatuses {
  ENABLED = 'MTLS_ENABLED',
  ENABLED_DEFAULT = 'MTLS_ENABLED_DEFAULT',
  ENABLED_EXTENDED = 'MTLS_ENABLED_EXTENDED',
  PARTIALLY = 'MTLS_PARTIALLY_ENABLED',
  PARTIALLY_DEFAULT = 'MTLS_PARTIALLY_ENABLED_DEFAULT',
  AUTO_DEFAULT = 'AUTO_MTLS_DEFAULT',
  NOT_ENABLED = 'MTLS_NOT_ENABLED',
  DISABLED = 'MTLS_DISABLED',
}

export interface TLSStatus {
  status: string;
  autoMTLSEnabled: boolean;
  minTLS: string;
}
