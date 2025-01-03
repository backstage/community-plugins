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
import { AppHealthResponse } from '../types/Health';
import { Namespace } from './Namespace';
import { Runtime } from './Workload';

export interface AppId {
  app: string;
  cluster?: string;
  namespace: string;
}

export interface AppWorkload {
  istioSidecar: boolean;
  istioAmbient: boolean;
  labels: { [key: string]: string };
  serviceAccountNames: string[];
  workloadName: string;
}

export interface App {
  cluster?: string;
  health: AppHealthResponse;
  name: string;
  namespace: Namespace;
  runtimes: Runtime[];
  serviceNames: string[];
  workloads: AppWorkload[];
}

export interface AppQuery {
  health: 'true' | 'false';
  rateInterval: string;
}
