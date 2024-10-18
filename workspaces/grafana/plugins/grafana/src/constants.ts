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

import { Entity } from '@backstage/catalog-model';

/**
 * Grafana tag selector annotation
 * @public
 * @deprecated Use GRAFANA_ANNOTATION_DASHBOARD_SELECTOR instead.
 */
export const GRAFANA_ANNOTATION_TAG_SELECTOR = 'grafana/tag-selector';

/**
 * Grafana dashboard selector annotation
 * @public
 */
export const GRAFANA_ANNOTATION_DASHBOARD_SELECTOR =
  'grafana/dashboard-selector';

/**
 * Grafana alert selector annotation
 * @public
 */
export const GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR =
  'grafana/alert-label-selector';

/**
 * Grafana dashboard overview annotation
 * @public
 */
export const GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD =
  'grafana/overview-dashboard';

/**
 * Returns if the dashboard selector annotation for an entity is set
 * @public
 */
export const isDashboardSelectorAvailable = (entity: Entity) =>
  entity?.metadata.annotations?.[GRAFANA_ANNOTATION_DASHBOARD_SELECTOR] ||
  entity?.metadata.annotations?.[GRAFANA_ANNOTATION_TAG_SELECTOR];

/**
 * Returns if the alert selector annotation for an entity is set
 * @public
 */
export const isAlertSelectorAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.[GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR],
  );

/**
 * Returns if the overview dashboard annotation for an entity is set
 * @public
 */
export const isOverviewDashboardAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.[GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD],
  );

/**
 * Returns the dashboard selector annotation for an entity
 * @public
 */
export const dashboardSelectorFromEntity = (entity: Entity) =>
  entity?.metadata.annotations?.[GRAFANA_ANNOTATION_DASHBOARD_SELECTOR] ??
  entity?.metadata.annotations?.[GRAFANA_ANNOTATION_TAG_SELECTOR] ??
  '';
/**
 * Returns the alert selector annotation for an entity
 * @public
 */
export const alertSelectorFromEntity = (entity: Entity) => {
  const annotation =
    entity?.metadata.annotations?.[GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR] ??
    '';
  const selectors = annotation.split(',').map(l => l.trim());
  if (selectors.length > 1) {
    return selectors;
  }
  return annotation;
};

/**
 * Returns the overview dashboard annotation for an entity
 * @public
 */
export const overviewDashboardFromEntity = (entity: Entity) =>
  entity?.metadata.annotations?.[GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD] ?? '';

/**
 * Returns the dashboard selector annotation for an entity
 * @public
 * @deprecated Use dashboardSelectorFromEntity instead
 */
export const tagSelectorFromEntity = dashboardSelectorFromEntity;
