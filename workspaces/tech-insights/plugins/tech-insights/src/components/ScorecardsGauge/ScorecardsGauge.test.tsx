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
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import {
  jsonRulesEngineCheckResultRenderer,
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import { ScorecardsGauge } from './ScorecardsGauge';

const result = (id: string, name: string, passed: boolean): CheckResult => ({
  facts: {},
  check: {
    id,
    type: 'json-rules-engine',
    name,
    description: `Verifies **${id}**`,
    factIds: [],
  },
  result: passed,
});

const api = {
  getCheckResultRenderers: () => [jsonRulesEngineCheckResultRenderer],
  isCheckResultFailed: (r: CheckResult) => !r.result,
} as unknown as TechInsightsApi;

const renderGauge = (description?: string) =>
  renderInTestApp(
    <TestApiProvider apis={[[techInsightsApiRef, api]]}>
      <ScorecardsGauge
        title="Production readiness"
        description={description}
        checkResults={[
          result('readme', 'Has README', true),
          result('owner', 'Has owner', false),
        ]}
      />
    </TestApiProvider>,
  );

describe('ScorecardsGauge', () => {
  it('shows the title, the optional description and the checks', async () => {
    const { unmount } = await renderGauge('Checks for production');
    expect(
      screen.getByRole('heading', { name: 'Production readiness' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Checks for production')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Checks/ })).toHaveTextContent(
      '1/2',
    );
    expect(screen.getByText('Has owner')).toBeInTheDocument();
    unmount();

    await renderGauge();
    expect(screen.queryByText('Checks for production')).not.toBeInTheDocument();
  });
});
