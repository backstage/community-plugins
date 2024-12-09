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
import React from 'react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  isAlertSelectorAvailable,
  isDashboardSelectorAvailable,
  isOverviewDashboardAvailable,
} from '../constants';

/**
 * @alpha
 */
export const entityGrafanaDashboardsCard = EntityCardBlueprint.make({
  name: 'dashboards',
  params: {
    filter: entity => Boolean(isDashboardSelectorAvailable(entity)),
    loader: () =>
      import('../components/DashboardsCard').then(m => <m.DashboardsCard />),
  },
});

/**
 * @alpha
 */
export const entityGrafanaAlertsCard = EntityCardBlueprint.make({
  name: 'alerts',
  params: {
    filter: entity =>
      Boolean(isDashboardSelectorAvailable(entity)) ||
      isAlertSelectorAvailable(entity),
    loader: () =>
      import('../components/AlertsCard').then(m => <m.AlertsCard />),
  },
});

/**
 * @alpha
 */
export const entityGrafanaOverviewDashboardViewer = EntityCardBlueprint.make({
  name: 'overview-dashboard',
  params: {
    filter: entity => isOverviewDashboardAvailable(entity),
    loader: () =>
      import('../components/DashboardViewer').then(m => (
        <m.EntityDashboardViewer />
      )),
  },
});
