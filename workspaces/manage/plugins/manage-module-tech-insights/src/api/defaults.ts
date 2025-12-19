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

import { ProgressColor } from '@backstage-community/plugin-manage-react';
import { ManageTechInsightsMapTitle } from '../title';

export function defaultGetPercentColor(percent: number): ProgressColor {
  if (percent >= 100) return 'success';
  else if (percent > 50) return 'warning';
  return 'error';
}

export const defaultMapTitle: ManageTechInsightsMapTitle = check => ({
  title: check.name,
  tooltip: check.description,
});
