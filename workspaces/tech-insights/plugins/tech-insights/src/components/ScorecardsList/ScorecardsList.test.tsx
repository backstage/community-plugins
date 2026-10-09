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
import { ScorecardsList } from './ScorecardsList';

const checkResults: CheckResult[] = [
  {
    facts: {},
    check: {
      id: 'readme',
      type: 'json-rules-engine',
      name: 'Has README',
      description: 'Repository has a **README**',
      factIds: [],
    },
    result: true,
  },
];

const api = {
  getCheckResultRenderers: () => [jsonRulesEngineCheckResultRenderer],
} as unknown as TechInsightsApi;

const renderList = (hideDescription?: boolean) =>
  renderInTestApp(
    <TestApiProvider apis={[[techInsightsApiRef, api]]}>
      <ScorecardsList
        checkResults={checkResults}
        hideDescription={hideDescription}
      />
    </TestApiProvider>,
  );

describe('ScorecardsList', () => {
  it('shows the description inline, or as a tooltip when hidden', async () => {
    const { unmount } = await renderList();
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'Has READMERepository has a README',
    );
    expect(screen.getByLabelText('Passed')).toBeInTheDocument();
    unmount();

    await renderList(true);
    expect(screen.queryByText('README')).not.toBeInTheDocument();
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Repository has a README',
    );
  });
});
