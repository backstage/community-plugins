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

import React, { ComponentType } from 'react';
import { getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectSelect } from './ProjectSelect';
import { MockFilterProvider } from '../../testUtils';
import { renderInTestApp } from '@backstage/test-utils';

const mockProjects = [
  { id: 'project1' },
  { id: 'project2', name: 'Project 2' },
  { id: 'project3' },
];

describe('<ProjectSelect />', () => {
  let Component: ComponentType;
  beforeEach(() => {
    Component = () => (
      <MockFilterProvider>
        <ProjectSelect
          project="all"
          projects={mockProjects}
          onSelect={jest.fn()}
        />
      </MockFilterProvider>
    );
  });

  it('Renders without exploding', async () => {
    await renderInTestApp(Component);
    expect(screen.getByText('All Projects')).toBeInTheDocument();
  });

  it('shows all projects in the filter select', async () => {
    await renderInTestApp(Component);
    const projectSelectContainer = screen.getByTestId('project-filter-select');
    const button = getByRole(projectSelectContainer, 'button');
    await userEvent.click(button);
    await waitFor(() => screen.getByTestId('option-all'));

    mockProjects.forEach(project =>
      expect(screen.getByText(project.name ?? project.id)).toBeInTheDocument(),
    );
  });
});
