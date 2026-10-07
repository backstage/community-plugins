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
import { Check } from '@backstage-community/plugin-tech-insights-common';
import {
  TechInsightsApi,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import { Filters } from './Filters';

const checks: Check[] = [
  {
    id: 'has-readme',
    type: 'json-rules-engine',
    name: 'Has README',
    description: 'Repository has a README',
    factIds: [],
  },
  {
    id: 'has-owner',
    type: 'json-rules-engine',
    name: 'Has owner',
    description: 'Entity has an owner',
    factIds: [],
  },
];

describe('Filters', () => {
  it('reports selected checks and Yes/No filter changes', async () => {
    const api = {
      getAllChecks: jest.fn(async () => checks),
    } as unknown as TechInsightsApi;
    const checksChanged = jest.fn();
    const withResultsChanged = jest.fn();
    const hasFailedChecksChanged = jest.fn();

    await renderInTestApp(
      <TestApiProvider apis={[[techInsightsApiRef, api]]}>
        <Filters
          checksChanged={checksChanged}
          withResultsChanged={withResultsChanged}
          hasFailedChecksChanged={hasFailedChecksChanged}
        />
      </TestApiProvider>,
    );

    const withResults = screen.getByRole('button', {
      name: /Only with results/,
    });
    expect(withResults).toHaveTextContent('Yes');
    const hasFailed = screen.getByRole('button', { name: /Has failed checks/ });
    expect(hasFailed).toHaveTextContent('No');

    await userEvent.click(screen.getByRole('button', { name: /Checks/ }));
    const readme = await screen.findByRole('option', { name: /Has README/ });
    expect(readme).toHaveTextContent('has-readme');
    await userEvent.click(readme);
    await userEvent.click(screen.getByRole('option', { name: /Has owner/ }));
    expect(checksChanged).toHaveBeenLastCalledWith(checks);
    await userEvent.keyboard('{Escape}');

    await userEvent.click(withResults);
    await userEvent.click(await screen.findByRole('option', { name: 'No' }));
    expect(withResultsChanged).toHaveBeenCalledWith(false);

    await userEvent.click(hasFailed);
    await userEvent.click(await screen.findByRole('option', { name: 'Yes' }));
    expect(hasFailedChecksChanged).toHaveBeenCalledWith(true);
  });
});
