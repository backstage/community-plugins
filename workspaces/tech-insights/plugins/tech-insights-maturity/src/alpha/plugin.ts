/*
 * Copyright 2026 The Backstage Authors
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
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { maturityApi } from './apis';
import { entityMaturityScorecardContent } from './entityContent';
import { entityMaturitySummaryContent } from './entitySummaryContent';
import { entityMaturitySummaryCard } from './entityCards';
import { maturityPage } from './pages';

/**
 * The Tech Insights Maturity frontend plugin for the new Backstage frontend system.
 *
 * @alpha
 */
const techInsightsMaturityPlugin = createFrontendPlugin({
  pluginId: 'tech-insights-maturity',
  extensions: [
    maturityApi,
    maturityPage,
    entityMaturityScorecardContent,
    entityMaturitySummaryContent,
    entityMaturitySummaryCard,
  ],
});

export default techInsightsMaturityPlugin;
