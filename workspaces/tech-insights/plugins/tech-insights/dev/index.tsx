/*
 * Copyright 2021 The Backstage Authors
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
import { createDevApp } from '@backstage/dev-utils';
import {
  techInsightsPlugin,
  EntityTechInsightsScorecardContent,
  TechInsightsScorecardPage,
} from '../src';
import {
  Check,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import { CompoundEntityRef, Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  bulkCheckResponse,
  checkResultRenderers,
  runChecksResponse,
} from './mocks';
import {
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';

const entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'random-name',
  },
} as Entity;

createDevApp()
  .registerPlugin(techInsightsPlugin)
  .registerApi({
    api: techInsightsApiRef,
    deps: {},
    factory: () =>
      ({
        getCheckResultRenderers: (_: string[]) => checkResultRenderers,
        isCheckResultFailed: (_: CheckResult) => true,
        getAllChecks: async () => [],
        runChecks: async (_: CompoundEntityRef, __?: string[]) =>
          runChecksResponse,
        runBulkChecks: async (_: CompoundEntityRef[], __?: Check[]) =>
          bulkCheckResponse,
        getFacts: async (_: CompoundEntityRef, __: string[]) => '' as any,
        getFactSchemas: async () => [],
        getLinksForEntity: () => [],
      } as TechInsightsApi),
  })
  .addPage({
    element: (
      <EntityProvider entity={entity}>
        <EntityTechInsightsScorecardContent title="Test scorecard" />
      </EntityProvider>
    ),
    title: 'Tech insights card',
    path: '/tech-insight-scorecard',
  })
  .addPage({
    element: <TechInsightsScorecardPage />,
    title: 'Tech insights page',
    path: '/tech-insight-page',
  })
  .render();
