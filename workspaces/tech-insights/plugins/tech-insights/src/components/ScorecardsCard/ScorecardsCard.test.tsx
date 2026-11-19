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
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import {
  jsonRulesEngineCheckResultRenderer,
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import { ScorecardsCard } from './ScorecardsCard';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { namespace: 'default', name: 'my-service' },
};

const result: CheckResult = {
  facts: {},
  check: {
    id: 'readme',
    type: 'json-rules-engine',
    name: 'Has README',
    description: 'Repository has a README',
    factIds: [],
  },
  result: true,
};

const renderComponent = (runChecks: TechInsightsApi['runChecks']) => {
  const api = {
    runChecks: jest.fn(runChecks),
    getCheckResultRenderers: () => [jsonRulesEngineCheckResultRenderer],
    isCheckResultFailed: (r: CheckResult) => !r.result,
    getLinksForEntity: () => [],
  } as unknown as TechInsightsApi;

  return renderInTestApp(
    <TestApiProvider apis={[[techInsightsApiRef, api]]}>
      <EntityProvider entity={entity}>
        <ScorecardsCard title="Production readiness" />
      </EntityProvider>
    </TestApiProvider>,
  );
};

describe('ScorecardsCard', () => {
  it('shows check results, or the error name and message', async () => {
    const { unmount } = await renderComponent(async () => [result]);
    expect(
      await screen.findByRole('button', { name: /Production readiness/ }),
    ).toHaveTextContent('1/1');
    expect(screen.getByText('Has README')).toBeInTheDocument();
    unmount();

    await renderComponent(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await screen.findByText('TypeError')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    expect(screen.queryByText('Production readiness')).not.toBeInTheDocument();
  });
});
