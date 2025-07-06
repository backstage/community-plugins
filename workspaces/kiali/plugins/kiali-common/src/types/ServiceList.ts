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
import { ServiceHealth } from '../func';
import { ObjectReference, ObjectValidation, Validations } from './IstioObjects';
import { AdditionalItem } from './Workload';

export interface ServiceList {
  cluster?: string;
  services: ServiceListItem[];
  validations: Validations;
}

export interface ServiceOverview {
  name: string;
  cluster?: string;
  istioSidecar: boolean;
  istioAmbient: boolean;
  additionalDetailSample?: AdditionalItem;
  labels: { [key: string]: string };
  ports: { [key: string]: number };
  istioReferences: ObjectReference[];
  kialiWizard: string;
  serviceRegistry: string;
  health: ServiceHealth;
}

export interface ServiceListItem extends ServiceOverview {
  namespace: string;
  validation?: ObjectValidation;
}

export interface ServiceListQuery {
  health: 'true' | 'false';
  istioResources: 'true' | 'false';
  onlyDefinitions: 'true' | 'false';
  rateInterval: string;
}
