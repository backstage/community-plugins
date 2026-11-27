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
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import {
  jsonRulesEngineCheckResultRenderer,
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import { EntityTechInsightsScorecardCard } from '../../plugin';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'my-service', namespace: 'default' },
  spec: { type: 'service', owner: 'team-a', lifecycle: 'production' },
};

const techInsightsApi: Partial<TechInsightsApi> = {
  runChecks: jest.fn().mockResolvedValue([
    {
      check: {
        id: 'hasOwner',
        type: 'json-rules-engine',
        name: 'Has an owner',
        description: 'The entity names an owner',
        factIds: ['entityOwnershipFactRetriever'],
      },
      facts: {},
      result: true,
    },
  ]),
  getCheckResultRenderers: () => [jsonRulesEngineCheckResultRenderer],
  isCheckResultFailed: () => false,
  getLinksForEntity: () => [],
};

describe('EntityTechInsightsScorecardCard', () => {
  it('renders without the Tech Insights page mounted', async () => {
    // No mountedRoutes: the app has no route for the Tech Insights page.
    const { findByText } = await renderInTestApp(
      <TestApiProvider apis={[[techInsightsApiRef, techInsightsApi]]}>
        <EntityProvider entity={entity}>
          <EntityTechInsightsScorecardCard title="Scorecards" />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(await findByText('Scorecards')).toBeInTheDocument();
    expect(await findByText('Has an owner')).toBeInTheDocument();
  });
});
