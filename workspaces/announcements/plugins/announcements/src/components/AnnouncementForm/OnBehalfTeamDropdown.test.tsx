/*
 * Copyright 2025 The Backstage Authors
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
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnBehalfTeamDropdown from './OnBehalfTeamDropdown';

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  useAnnouncementsTranslation: () => ({ t: (key: string) => key }),
  useCatalogEntities: () => ({
    entities: [
      {
        relations: [
          { type: 'memberOf', targetRef: 'group:default/team-a' },
          { type: 'memberOf', targetRef: 'group:default/team-b' },
        ],
      },
    ],
    loading: false,
  }),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: () => ({
    getBackstageIdentity: jest
      .fn()
      .mockResolvedValue({ userEntityRef: 'user-1' }),
  }),
}));

describe('OnBehalfTeamDropdown', () => {
  it('should display the dropdown with correct options', async () => {
    const handleChange = jest.fn();

    render(<OnBehalfTeamDropdown selectedTeam="" onChange={handleChange} />);

    const dropdown = screen.getByLabelText('announcementForm.onBehalfOf');
    await userEvent.click(dropdown);

    expect(await screen.findByText('group:default/team-a')).toBeInTheDocument();
    expect(await screen.findByText('group:default/team-b')).toBeInTheDocument();
  });
});
