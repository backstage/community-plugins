/*
 * Copyright 2020 The Backstage Authors
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

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { Incidents } from './Incidents';
import { TestApiRegistry, renderInTestApp } from '@backstage/test-utils';
import { splunkOnCallApiRef } from '../../api';
import { MOCK_TEAM, MOCK_INCIDENT } from '../../api/mocks';

import { alertApiRef } from '@backstage/core-plugin-api';
import { ApiProvider } from '@backstage/core-app-api';

const mockSplunkOnCallApi = {
  getIncidents: jest.fn(),
  getTeams: jest.fn(),
};
const apis = TestApiRegistry.from(
  [alertApiRef, {}],
  [splunkOnCallApiRef, mockSplunkOnCallApi],
);

describe('Incidents', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('Renders an empty state when there are no incidents', async () => {
    mockSplunkOnCallApi.getIncidents.mockResolvedValue([]);
    mockSplunkOnCallApi.getTeams.mockResolvedValue([MOCK_TEAM]);

    await renderInTestApp(
      <ApiProvider apis={apis}>
        <Incidents readOnly={false} refreshIncidents={false} team="test" />
      </ApiProvider>,
    );
    jest.advanceTimersByTime(2000);
    await waitFor(() => expect(screen.queryByTestId('progress')).toBe(null));
    await waitFor(() =>
      expect(screen.getByText('Nice! No incidents found!')).toBeInTheDocument(),
    );
  });

  it('Renders all incidents', async () => {
    mockSplunkOnCallApi.getIncidents.mockResolvedValue([MOCK_INCIDENT]);
    mockSplunkOnCallApi.getTeams.mockResolvedValue([MOCK_TEAM]);

    await renderInTestApp(
      <ApiProvider apis={apis}>
        <Incidents readOnly={false} team="test" refreshIncidents={false} />
      </ApiProvider>,
    );
    jest.advanceTimersByTime(2000);
    await waitFor(() => expect(screen.queryByTestId('progress')).toBe(null));
    await waitFor(() =>
      expect(
        screen.getByText('user', {
          exact: false,
        }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('test-incident')).toBeInTheDocument();
    expect(screen.getByTitle('Acknowledged')).toBeInTheDocument();
    expect(screen.getByLabelText('Status warning')).toBeInTheDocument();

    // assert links, mailto and hrefs, date calculation
    expect(screen.getAllByTitle('View in Splunk On-Call').length).toEqual(1);
  });

  it('does not render incident action buttons in read only mode', async () => {
    mockSplunkOnCallApi.getIncidents.mockResolvedValue([MOCK_INCIDENT]);
    mockSplunkOnCallApi.getTeams.mockResolvedValue([MOCK_TEAM]);

    await renderInTestApp(
      <ApiProvider apis={apis}>
        <Incidents readOnly team="test" refreshIncidents={false} />
      </ApiProvider>,
    );
    jest.advanceTimersByTime(2000);
    await waitFor(() => expect(screen.queryByTestId('progress')).toBe(null));
    await waitFor(() =>
      expect(
        screen.getByText('user', {
          exact: false,
        }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('test-incident')).toBeInTheDocument();
    expect(screen.getByLabelText('Status warning')).toBeInTheDocument();
    expect(() => screen.getAllByTitle('Acknowledge')).toThrow(
      'Unable to find an element with the title: Acknowledge.',
    );
    expect(() => screen.getAllByTitle('Resolve')).toThrow(
      'Unable to find an element with the title: Resolve.',
    );

    // assert links, mailto and hrefs, date calculation
    expect(screen.getAllByTitle('View in Splunk On-Call').length).toEqual(1);
  });

  it('Handle errors', async () => {
    mockSplunkOnCallApi.getIncidents.mockRejectedValueOnce(
      new Error('Error occurred'),
    );
    mockSplunkOnCallApi.getTeams.mockResolvedValue([]);

    await renderInTestApp(
      <ApiProvider apis={apis}>
        <Incidents readOnly={false} team="test" refreshIncidents={false} />
      </ApiProvider>,
    );
    jest.advanceTimersByTime(2000);
    await waitFor(() => expect(screen.queryByTestId('progress')).toBe(null));
    await waitFor(() =>
      expect(
        screen.getByText(
          'Error encountered while fetching information. Error occurred',
        ),
      ).toBeInTheDocument(),
    );
  });
});
