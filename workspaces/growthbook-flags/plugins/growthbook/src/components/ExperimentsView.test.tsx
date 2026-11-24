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
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { fireEvent } from '@testing-library/react';
import type { ExperimentRow } from '@backstage-community/plugin-growthbook-common';
import { growthbookFlagsApiRef, GrowthbookFlagsApi } from '../api';
import { ExperimentsView } from './ExperimentsView';

const running: ExperimentRow = {
  id: 'exp_1',
  name: 'Checkout button colour',
  status: 'running',
  tags: [],
  variations: [
    { id: 'v0', key: '0', name: 'Control' },
    { id: 'v1', key: '1', name: 'Green' },
  ],
  phases: [{ name: 'Main', dateStarted: '2026-09-01T00:00:00Z' }],
  url: 'https://gb.example.com/experiment/exp_1',
};

const stopped: ExperimentRow = {
  ...running,
  id: 'exp_2',
  name: 'Pricing page',
  status: 'stopped',
  phases: [
    {
      name: 'Main',
      dateStarted: '2026-08-01T00:00:00Z',
      dateEnded: '2026-08-15T00:00:00Z',
    },
  ],
  winnerVariationId: 'v1',
};

describe('ExperimentsView', () => {
  const api: jest.Mocked<GrowthbookFlagsApi> = {
    getFlags: jest.fn(),
    getProjects: jest.fn(),
    getExperiments: jest.fn(),
    getExperimentResults: jest.fn(),
    getFlagDetail: jest.fn(),
  };

  beforeEach(() => jest.resetAllMocks());

  const render = (experiments: ExperimentRow[]) =>
    renderInTestApp(
      <TestApiProvider apis={[[growthbookFlagsApiRef, api]]}>
        <ExperimentsView experiments={experiments} />
      </TestApiProvider>,
    );

  it('lists experiments with status, link and winner name', async () => {
    const { findByText, getByRole } = await render([running, stopped]);
    expect(await findByText('Checkout button colour')).toBeInTheDocument();
    expect(
      getByRole('link', { name: 'Checkout button colour' }),
    ).toHaveAttribute('href', 'https://gb.example.com/experiment/exp_1');
    expect(await findByText('running')).toBeInTheDocument();
    expect(await findByText('stopped')).toBeInTheDocument();
    expect(await findByText('Green')).toBeInTheDocument(); // winner column
  });

  it('does not request results until a row is expanded', async () => {
    api.getExperimentResults.mockResolvedValue({
      available: false,
      variations: [],
    });
    const { findByLabelText } = await render([running]);
    expect(api.getExperimentResults).not.toHaveBeenCalled();
    fireEvent.click(
      await findByLabelText('Show results for Checkout button colour'),
    );
    expect(api.getExperimentResults).toHaveBeenCalledWith('exp_1');
  });

  it('renders per-variation results when available', async () => {
    api.getExperimentResults.mockResolvedValue({
      available: true,
      metricName: 'Purchase rate',
      variations: [
        { id: 'v0', name: 'Control', users: 1000 },
        {
          id: 'v1',
          name: 'Green',
          users: 990,
          percentChange: 0.12,
          ciLow: 0.02,
          ciHigh: 0.22,
          chanceToBeatControl: 0.97,
        },
      ],
    });
    const { findByLabelText, findByText } = await render([running]);
    fireEvent.click(
      await findByLabelText('Show results for Checkout button colour'),
    );
    expect(await findByText(/Purchase rate/)).toBeInTheDocument();
    expect(await findByText('97.0%')).toBeInTheDocument();
    expect(await findByText('+12.00%')).toBeInTheDocument();
    expect(await findByText('1,000')).toBeInTheDocument();
  });

  it('shows "Results not available" when there are no results', async () => {
    api.getExperimentResults.mockResolvedValue({
      available: false,
      variations: [],
    });
    const { findByLabelText, findByText } = await render([running]);
    fireEvent.click(
      await findByLabelText('Show results for Checkout button colour'),
    );
    expect(await findByText('Results not available')).toBeInTheDocument();
  });

  it('shows an error only inside the expanded row when results fail', async () => {
    api.getExperimentResults.mockRejectedValue(new Error('results exploded'));
    const { findByLabelText, findAllByText, getByText } = await render([
      running,
    ]);
    fireEvent.click(
      await findByLabelText('Show results for Checkout button colour'),
    );
    expect((await findAllByText(/results exploded/)).length).toBeGreaterThan(0);
    expect(getByText('Checkout button colour')).toBeInTheDocument();
  });
});
