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
import { AppList, AppListItem } from '../../types/AppList';
import { AppHealth } from '../../types/Health';
import { sortIstioReferences } from './FiltersAndSorts';

export const getAppItems = (
  data: AppList,
  rateInterval: number,
): AppListItem[] => {
  if (data.applications) {
    return data.applications.map(app => ({
      namespace: data.namespace.name,
      name: app.name,
      istioSidecar: app.istioSidecar,
      istioAmbient: app.istioAmbient,
      health: AppHealth.fromJson(data.namespace.name, app.name, app.health, {
        rateInterval: rateInterval,
        hasSidecar: app.istioSidecar,
        hasAmbient: app.istioAmbient,
      }),
      labels: app.labels,
      istioReferences: sortIstioReferences(app.istioReferences, true),
      cluster: app.cluster,
    }));
  }
  return [];
};
