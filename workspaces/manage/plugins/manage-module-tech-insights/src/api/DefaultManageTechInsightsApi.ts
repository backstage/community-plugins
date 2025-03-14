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
import type { ProgressColor } from '@backstage-community/plugin-manage-react';

import type { ManageTechInsights } from './ManageTechInsights';
import { ManageProviderTechInsights } from '../components/ManageProvider';
import { ManageTechInsightsMapTitle } from '../title';

function defaultGetPercentColor(percent: number): ProgressColor {
  if (percent >= 100) return 'success';
  else if (percent > 50) return 'warning';
  return 'error';
}

/**
 * Options for the {@link DefaultManageTechInsightsApi}.
 *
 * @public
 */
export interface DefaultManageApiOptions {
  /**
   * Custom filter to only show certain checks.
   */
  checkFilter?: (check: Check) => boolean;

  /**
   * Override the default colors for gauges.
   *
   * @param percent - number between 0 and 100
   */
  getPercentColor?: (percent: number) => ProgressColor;

  /**
   * The default mapping of checks to titles for the
   * {@link ManageTechInsightsCards} and {@link ManageTechInsightsGrid}
   * components.
   */
  mapTitle?: ManageTechInsightsMapTitle;
}

const defaultMapTitle: ManageTechInsightsMapTitle = check => ({
  title: check.name,
  tooltip: check.description,
});

/**
 * Default implementation of the {@link ManageTechInsights} API.
 *
 * @public
 */
export class DefaultManageTechInsightsApi implements ManageTechInsights {
  readonly checkFilter: (check: Check) => boolean;
  readonly getPercentColor: (percent: number) => ProgressColor;
  readonly mapTitle: ManageTechInsightsMapTitle;

  public constructor(options: DefaultManageApiOptions = {}) {
    this.checkFilter = options.checkFilter ?? (() => true);
    this.getPercentColor = options.getPercentColor ?? defaultGetPercentColor;
    this.mapTitle = options.mapTitle ?? defaultMapTitle;
  }

  getProvider = () => ManageProviderTechInsights;
}
