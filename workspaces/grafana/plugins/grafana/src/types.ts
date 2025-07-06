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
 * Grafana daashboard parameters
 * @public
 */
export interface Dashboard {
  /**
   * The dashboard title
   * @public
   */
  title: string;
  /**
   * The endpoint to the dashboard
   * @public
   */
  url: string;
  /**
   * The folder title, if any
   * @public
   */
  folderTitle: string | undefined;
  /**
   * The endpoint to the folder
   * @public
   */
  folderUrl: string;
  /**
   * A list of tags assigned to the dashboard
   * @public
   */
  tags: string[];
}

/**
 * Grafana alert parameters
 * @public
 */
export interface Alert {
  /**
   * The alert name
   * @public
   */
  name: string;
  /**
   * The alert state
   * @public
   */
  state: string;
  /**
   * The matching selector for the alert
   * @public
   */
  matchingSelector: string;
  /**
   * The endpoint to the alert
   * @public
   */
  url: string;
}

/**
 * Parameters used to display the alert card
 * @public
 */
export type AlertsCardOpts = {
  paged?: boolean;
  searchable?: boolean;
  pageSize?: number;
  sortable?: boolean;
  title?: string;
  showState?: boolean;
};

/**
 * Parameters used to display the dashboard card
 * @public
 */
export type DashboardCardOpts = {
  paged?: boolean;
  searchable?: boolean;
  pageSize?: number;
  sortable?: boolean;
  title?: string;
  additionalDashboards?: (entity: Entity) => Dashboard[];
};
