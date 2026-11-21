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
import { growthbookFlagsApiRef, GrowthbookFlagsApi } from '../api';
import { FlagDetailPanel } from './FlagDetailPanel';

const detail = {
  key: 'my-flag',
  dateUpdated: '2026-09-20T10:00:00Z',
  archived: false,
  owner: 'bob',
  tags: ['beta'],
  isStale: true,
  staleReason: 'no-rules',
  environments: [
    { name: 'dev', enabled: false, rules: [] },
    {
      name: 'prod',
      enabled: true,
      rules: [{ type: 'force', description: 'EU only', enabled: true }],
    },
  ],
};

describe('FlagDetailPanel', () => {
  const api: jest.Mocked<GrowthbookFlagsApi> = {
    getFlags: jest.fn(),
    getProjects: jest.fn(),
    getExperiments: jest.fn(),
    getExperimentResults: jest.fn(),
    getFlagDetail: jest.fn(),
  };
  beforeEach(() => jest.resetAllMocks());

  const render = () =>
    renderInTestApp(
      <TestApiProvider apis={[[growthbookFlagsApiRef, api]]}>
        <FlagDetailPanel flagKey="my-flag" />
      </TestApiProvider>,
    );

  it('shows stale status, metadata, environments and rules', async () => {
    api.getFlagDetail.mockResolvedValue(detail);
    const { findByText, getByText } = await render();
    expect(await findByText('Stale: no-rules')).toBeInTheDocument();
    expect(getByText(/Owner: bob/)).toBeInTheDocument();
    expect(getByText('2026-09-20')).toBeInTheDocument();
    expect(getByText('prod')).toBeInTheDocument();
    expect(getByText(/force/)).toBeInTheDocument();
    expect(getByText(/EU only/)).toBeInTheDocument();
    expect(getByText('0 rules')).toBeInTheDocument();
  });

  it('shows no stale chip for an active flag', async () => {
    api.getFlagDetail.mockResolvedValue({
      ...detail,
      isStale: false,
      staleReason: undefined,
    });
    const { findByText, queryByText } = await render();
    await findByText('prod');
    expect(queryByText(/Stale/)).not.toBeInTheDocument();
  });

  it('shows an archived chip', async () => {
    api.getFlagDetail.mockResolvedValue({
      ...detail,
      archived: true,
      isStale: false,
    });
    const { findByText } = await render();
    expect(await findByText('Archived')).toBeInTheDocument();
  });

  it('shows an error panel when the request fails', async () => {
    api.getFlagDetail.mockRejectedValue(new Error('detail failed'));
    const { findAllByText } = await render();
    expect((await findAllByText(/detail failed/)).length).toBeGreaterThan(0);
  });
});
