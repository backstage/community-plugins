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
import userEvent from '@testing-library/user-event';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import {
  jsonRulesEngineCheckResultRenderer,
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import { ScorecardsBadge } from './ScorecardsBadge';

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
} as unknown as TechInsightsApi;

const renderBadge = (checkResults: CheckResult[]) =>
  renderInTestApp(
    <TestApiProvider apis={[[techInsightsApiRef, api]]}>
      <ScorecardsBadge checkResults={checkResults} />
    </TestApiProvider>,
  );

describe('ScorecardsBadge', () => {
  it('summarises passed checks and lists them in a tooltip', async () => {
    const { unmount } = await renderBadge([
      result('readme', 'Has README', true),
      result('owner', 'Has owner', false),
    ]);
    const badge = screen.getByLabelText('1 of 2 checks passed');
    expect(badge).toHaveTextContent('1/2');
    expect(screen.getByLabelText('Some checks failed')).toBeInTheDocument();

    await userEvent.tab();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Has README');
    expect(tooltip).toHaveTextContent('Has owner');
    unmount();

    await renderBadge([result('readme', 'Has README', true)]);
    expect(screen.getByLabelText('1 of 1 checks passed')).toHaveTextContent(
      '1/1',
    );
    expect(screen.getByLabelText('All checks passed')).toBeInTheDocument();
  });
});
