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

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IncidentsFilter } from './IncidentsFilter';

jest.mock('../shared-components/IncidentEnumFilter', () => ({
  IncidentEnumFilter: ({ label }: { label: string }) => (
    <div data-testid="incident-enum-filter">{label}</div>
  ),
}));

describe('IncidentsFilter', () => {
  it('renders both State and Priority filters', () => {
    render(
      <MemoryRouter>
        <IncidentsFilter />
      </MemoryRouter>,
    );

    const filters = screen.getAllByTestId('incident-enum-filter');
    expect(filters).toHaveLength(2);

    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('renders with a vertical layout (column)', () => {
    const { container } = render(
      <MemoryRouter>
        <IncidentsFilter />
      </MemoryRouter>,
    );
    const box = container.querySelector('div');
    expect(box).toHaveStyle('flex-direction: column');
  });
});
