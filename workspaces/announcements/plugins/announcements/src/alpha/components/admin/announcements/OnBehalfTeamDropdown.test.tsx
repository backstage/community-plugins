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

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { identityApiRef } from '@backstage/core-plugin-api';

import { OnBehalfTeamDropdown } from './OnBehalfTeamDropdown';

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  useAnnouncementsTranslation: () => ({ t: (key: string) => key }),
  useCatalogEntities: () => ({
    entities: [
      {
        kind: 'Group',
        metadata: { name: 'team-a', namespace: 'default' },
        spec: { profile: { displayName: 'Team A' } },
      },
      {
        kind: 'Group',
        metadata: { name: 'team-b', namespace: 'default' },
        spec: { profile: { displayName: 'Team B' } },
      },
    ],
    loading: false,
  }),
}));

const mockIdentityApi = {
  getBackstageIdentity: jest.fn().mockResolvedValue({
    userEntityRef: 'user:default/guest',
    ownershipEntityRefs: ['group:default/team-a', 'group:default/team-b'],
  }),
};

const renderOnBehalfTeamDropdown = async (props: {
  selectedTeam?: string;
  onChange?: jest.Mock;
}) => {
  const { selectedTeam = '', onChange = jest.fn() } = props;

  await renderInTestApp(
    <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
      <OnBehalfTeamDropdown selectedTeam={selectedTeam} onChange={onChange} />
    </TestApiProvider>,
  );

  return { onChange };
};

describe('OnBehalfTeamDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dropdown with label', async () => {
    await renderOnBehalfTeamDropdown({});

    expect(screen.getByText('announcementForm.onBehalfOf')).toBeInTheDocument();
  });

  it('displays team options when dropdown is opened', async () => {
    await renderOnBehalfTeamDropdown({});

    // Click the dropdown trigger button
    const dropdownButton = screen.getByRole('button', {
      name: /select an option/i,
    });
    await userEvent.click(dropdownButton);

    // Wait for listbox to appear and check for options using role
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });

    // Check that options are present (there are 2 options for Team A and Team B)
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);
  });

  it('calls onChange with selected team entityRef', async () => {
    const onChange = jest.fn();
    await renderOnBehalfTeamDropdown({ onChange });

    // Click the dropdown trigger button
    const dropdownButton = screen.getByRole('button', {
      name: /select an option/i,
    });
    await userEvent.click(dropdownButton);

    // Wait for listbox to appear
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Click the first option (Team A)
    const options = screen.getAllByRole('option');
    await userEvent.click(options[0]);

    // The onChange should be called with the entityRef (not the display name)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('group:default/team-a');
    });
  });
});
