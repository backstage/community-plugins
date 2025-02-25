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
import type { Check } from '@backstage-community/plugin-tech-insights-common/client';
import type {
  ManageModuleApi,
  ProgressColor,
} from '@backstage-community/plugin-manage-react';
import { ManageTechInsightsMapTitle } from '../title';

/**
 * ManageTechInsights API, which is a `ManageModuleApi` with additional
 * features used in the manage-module-tech-insights plugin.
 *
 * @public
 */
export interface ManageTechInsights extends ManageModuleApi {
  /**
   * Custom filter to only show certain checks.
   */
  checkFilter: (check: Check) => boolean;

  /**
   * Function to deduce what color to use of percentage gauges.
   */
  getPercentColor: (percent: number) => ProgressColor;

  /**
   * The mapping of checks to titles for the `ManageTechInsightsCards` and
   * `ManageTechInsightsGrid`
   */
  mapTitle: ManageTechInsightsMapTitle;
}
