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
import {
  Entity,
  RELATION_HAS_PART,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import { attachComponentData, configApiRef } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  EntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import {
  MaturitySummary,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { screen } from '@testing-library/react';
import { Outlet, Route, Routes } from 'react-router-dom';

import { maturityApiRef } from './api';
import {
  EntityMaturityScorecardContent,
  EntityMaturitySummaryContent,
} from './plugin';

const system: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'System',
  metadata: { namespace: 'default', name: 'parent' },
  relations: [
    { type: RELATION_HAS_PART, targetRef: 'component:default/child' },
  ],
  spec: { owner: 'team-a' },
};

const component: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { namespace: 'default', name: 'child' },
  relations: [{ type: RELATION_PART_OF, targetRef: 'system:default/parent' }],
  spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
};

const progress = { percentage: 100, totalChecks: 1, passedChecks: 1 };
const rankProgress = { percentage: 0, totalChecks: 0, passedChecks: 0 };
const summary: MaturitySummary = {
  rank: Rank.Silver,
  maxRank: Rank.Gold,
  isMaxRank: false,
  points: 100,
  progress,
  rankProgress,
  areaSummaries: [
    {
      area: 'Ownership',
      progress,
      rankProgress,
      rank: Rank.Silver,
      maxRank: Rank.Gold,
      isMaxRank: false,
    },
  ],
};

// Stands in for the catalog's entity page: it mounts the entity route and
// renders whichever entity tab matches below it.
const EntityPage = () => (
  <EntityProvider entity={system}>
    <Outlet />
  </EntityProvider>
);
attachComponentData(EntityPage, 'core.mountPoint', entityRouteRef);

/**
 * Renders the System's maturity summary tab in a classic-frontend entity page
 * where the Component scorecard tab and the System summary tab are mounted as
 * siblings at the same depth, e.g. a flat `EntitySwitch` of `EntityLayout`s:
 *
 *   Component: <EntityLayout.Route path={scorecardPath}> <EntityMaturityScorecardContent />
 *   System:    <EntityLayout.Route path="/maturity-summary"> <EntityMaturitySummaryContent />
 */
const renderSystemSummaryTab = async (scorecardPath: string) => {
  await renderInTestApp(
    <TestApiProvider
      apis={[
        [configApiRef, mockApis.config()],
        [
          catalogApiRef,
          {
            getEntitiesByRefs: jest
              .fn()
              .mockResolvedValue({ items: [component] }),
          },
        ],
        [
          maturityApiRef,
          {
            getMaturitySummary: jest.fn().mockResolvedValue(summary),
            getBulkMaturitySummary: jest
              .fn()
              .mockResolvedValue([
                { entity: 'component:default/child', summary },
              ]),
          },
        ],
      ]}
    >
      <Routes>
        <Route path="/catalog/:namespace/:kind/:name" element={<EntityPage />}>
          <Route
            path={scorecardPath}
            element={<EntityMaturityScorecardContent />}
          />
          <Route
            path="maturity-summary"
            element={<EntityMaturitySummaryContent />}
          />
        </Route>
      </Routes>
    </TestApiProvider>,
    { routeEntries: ['/catalog/default/system/parent/maturity-summary'] },
  );

  return (await screen.findByText('child')).closest('a');
};

describe('links from the maturity summary tab to child entities', () => {
  it('link to the child scorecard tab at its default path', async () => {
    const link = await renderSystemSummaryTab('maturity');

    expect(link).toHaveAttribute(
      'href',
      expect.stringMatching(
        /^\/catalog\/default\/component\/child\/maturity$/i,
      ),
    );
  });

  // Pending: links always go to `/maturity`, so a scorecard tab mounted at a
  // custom path cannot be reached from the summary tab.
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('link to the child scorecard tab at a custom path', async () => {
    const link = await renderSystemSummaryTab('scorecards');

    expect(link).toHaveAttribute(
      'href',
      expect.stringMatching(
        /^\/catalog\/default\/component\/child\/scorecards$/i,
      ),
    );
  });
});
