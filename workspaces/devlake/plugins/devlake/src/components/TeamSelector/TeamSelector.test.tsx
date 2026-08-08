/*
 * Copyright 2024 The Backstage Authors
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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { TeamSelector } from './TeamSelector';
import { DoraTeam } from '@backstage-community/plugin-devlake-common';

const teams: DoraTeam[] = [
  { name: 'All', devlakeProjectName: '__all__' },
  { name: 'Team Alpha', devlakeProjectName: 'project-alpha' },
  { name: 'Team Beta', devlakeProjectName: 'project-beta' },
];

describe('TeamSelector', () => {
  it('renders the Team label', async () => {
    await renderInTestApp(
      <TeamSelector
        teams={teams}
        selectedTeam="All"
        onTeamChange={jest.fn()}
      />,
    );
    // MUI Select renders label text in both the label and the fieldset legend
    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
  });

  it('renders the selected team name', async () => {
    await renderInTestApp(
      <TeamSelector
        teams={teams}
        selectedTeam="Team Alpha"
        onTeamChange={jest.fn()}
      />,
    );
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
  });

  it('renders with an empty teams list', async () => {
    await renderInTestApp(
      <TeamSelector teams={[]} selectedTeam="" onTeamChange={jest.fn()} />,
    );
    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
  });
});
