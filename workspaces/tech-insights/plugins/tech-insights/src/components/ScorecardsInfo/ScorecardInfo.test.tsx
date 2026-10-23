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
import { ComponentProps } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import {
  jsonRulesEngineCheckResultRenderer,
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import { ScorecardInfo } from './ScorecardInfo';

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

const renderInfo = (props: Partial<ComponentProps<typeof ScorecardInfo>>) =>
  renderInTestApp(
    <TestApiProvider apis={[[techInsightsApiRef, api]]}>
      <ScorecardInfo title="Scorecard" checkResults={[]} {...props} />
    </TestApiProvider>,
  );

describe('ScorecardInfo', () => {
  it('lists check results with a passed summary and collapses', async () => {
    await renderInfo({
      title: 'Production readiness',
      description: 'Checks for **production**',
      checkResults: [
        result('readme', 'Has README', true),
        result('owner', 'Has owner', false),
      ],
    });

    const trigger = screen.getByRole('button', {
      name: /Production readiness/,
    });
    expect(trigger).toHaveTextContent('1/2');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('Has README')).toBeInTheDocument();
    expect(screen.getByText('Has owner')).toBeInTheDocument();
    expect(screen.getByLabelText('Passed')).toBeInTheDocument();
    expect(screen.getByLabelText('Failed')).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('explains why there are no results', async () => {
    const { unmount } = await renderInfo({});
    expect(
      screen.getByText('No checks have any data yet.'),
    ).toBeInTheDocument();
    unmount();

    await renderInfo({ noWarning: true });
    expect(
      screen.getByText(
        'All checks passed, or no checks have been performed yet',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scorecard/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('starts collapsed when expanded is false', async () => {
    await renderInfo({ expanded: false });
    expect(screen.getByRole('button', { name: /Scorecard/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
