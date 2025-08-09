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

import { createSubRouteRef } from '@backstage/core-plugin-api';
import { Route, Routes } from 'react-router-dom';
import { rootRouteRef } from '../routes';
import {
  CostInsightsPage,
  LabelDataflowInstructionsPage,
  ProjectGrowthInstructionsPage,
} from '../components';

export const projectGrowthAlertSubRouteRef = createSubRouteRef({
  id: 'cost-insights/investigating-growth',
  parent: rootRouteRef,
  path: '/investigating-growth',
});

export const unlabeledDataflowAlertSubRouteRef = createSubRouteRef({
  id: 'cost-insights/labeling-jobs',
  parent: rootRouteRef,
  path: '/labeling-jobs',
});

export const CostInsightsRouter = () => (
  <Routes>
    <Route path="/" element={<CostInsightsPage />} />
    <Route
      path={projectGrowthAlertSubRouteRef.path}
      element={<ProjectGrowthInstructionsPage />}
    />
    <Route
      path={unlabeledDataflowAlertSubRouteRef.path}
      element={<LabelDataflowInstructionsPage />}
    />
  </Routes>
);
