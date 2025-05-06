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
export enum StatusKey {
  DISABLED_FEATURES = 'Disabled features',
  KIALI_CORE_COMMIT_HASH = 'Kiali commit hash',
  KIALI_CORE_VERSION = 'Kiali version',
  KIALI_CONTAINER_VERSION = 'Kiali container version',
  KIALI_STATE = 'Kiali state',
  MESH_NAME = 'Mesh name',
  MESH_VERSION = 'Mesh version',
  KIALI_EXTERNAL_URL = 'kialiExternalUrl',
}

// Renamed from Status due conflict in Health
export type StatusMap = { [K in StatusKey]?: string };

export interface ExternalServiceInfo {
  name: string;
  version?: string;
  url?: string;
}

export interface IstioEnvironment {
  isMaistra: boolean;
  istioAPIEnabled: boolean;
}

export interface StatusState {
  status: StatusMap;
  externalServices: ExternalServiceInfo[];
  warningMessages: string[];
  istioEnvironment: IstioEnvironment;
  providers: string[];
}
