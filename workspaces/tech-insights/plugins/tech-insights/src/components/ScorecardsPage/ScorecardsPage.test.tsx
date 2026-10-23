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
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import {
  BulkCheckResponse,
  Check,
} from '@backstage-community/plugin-tech-insights-common';
import {
  jsonRulesEngineCheckResultRenderer,
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import { ScorecardsPage } from './ScorecardsPage';

const check: Check = {
  id: 'readme',
  type: 'json-rules-engine',
  name: 'Has README',
  description: 'Repository has a README',
  factIds: [],
};

const bulkResults: BulkCheckResponse = [
  {
    entity: 'component:default/my-service',
    results: [{ facts: {}, check, result: true }],
  },
];

const renderPage = (getAllChecks: TechInsightsApi['getAllChecks']) => {
  const api = {
    getAllChecks: jest.fn(getAllChecks),
    runBulkChecks: jest.fn(async () => bulkResults),
    getCheckResultRenderers: () => [jsonRulesEngineCheckResultRenderer],
    getLinksForEntity: () => [],
  } as unknown as TechInsightsApi;

  return renderInTestApp(
    <TestApiProvider apis={[[techInsightsApiRef, api]]}>
      <ScorecardsPage />
    </TestApiProvider>,
    { mountedRoutes: { '/catalog/:namespace/:kind/:name': entityRouteRef } },
  );
};

describe('ScorecardsPage', () => {
  it('lists entities next to the filters, or shows the error', async () => {
    const { unmount } = await renderPage(async () => [check]);
    expect(
      await screen.findByRole('row', { name: /my-service/ }),
    ).toHaveTextContent('Has README');
    expect(screen.getByRole('button', { name: /Checks/ })).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
    unmount();

    await renderPage(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await screen.findByText('TypeError')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
