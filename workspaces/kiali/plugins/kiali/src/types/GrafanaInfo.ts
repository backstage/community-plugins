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
import { ExternalLink } from './Dashboards';

export const ISTIO_MESH_DASHBOARD = 'Istio Mesh Dashboard';
export const ISTIO_CONTROL_PLANE_DASHBOARD = 'Istio Control Plane Dashboard';
export const ISTIO_PERFORMANCE_DASHBOARD = 'Istio Performance Dashboard';
export const ISTIO_WASM_EXTENSION_DASHBOARD = 'Istio Wasm Extension Dashboard';

export const ISTIO_DASHBOARDS: string[] = [
  ISTIO_MESH_DASHBOARD,
  ISTIO_CONTROL_PLANE_DASHBOARD,
  ISTIO_PERFORMANCE_DASHBOARD,
  ISTIO_WASM_EXTENSION_DASHBOARD,
];

export interface GrafanaInfo {
  externalLinks: ExternalLink[];
}
