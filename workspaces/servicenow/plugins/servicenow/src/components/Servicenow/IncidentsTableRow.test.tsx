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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IncidentsTableRow } from './IncidentsTableRow';
import type { IncidentsData } from '../../types';

jest.mock('@mui/styles', () => ({
  makeStyles: () => () => ({}),
}));

jest.mock('../../utils/incidentUtils', () => ({
  getPriorityValue: jest.fn(() => 'High'),
  getIncidentStateValue: jest.fn(() => 'In Progress'),
}));

jest.mock('../../utils/stringUtils', () => ({
  convertDateFormat: jest.fn(() => 'December 12, 2016'),
}));

describe('IncidentsTableRow', () => {
  const mockData: IncidentsData = {
    sysId: '46e8219ba9fe1981013806b6e04fed06',
    number: 'INC0000001',
    shortDescription: 'Network issue in HQ',
    description:
      'A detailed description of the network problem that happened in HQ.',
    sysCreatedOn: '2016-12-12 15:19:57',
    priority: 2,
    incidentState: 2,
    url: 'https://dev-test.servicenow.com/nav_to.do?uri=incident.do?sys_id=46e8219ba9fe1981013806b6e04fed06',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all incident data fields correctly', () => {
    render(
      <table>
        <tbody>
          <IncidentsTableRow data={mockData} />
        </tbody>
      </table>,
    );

    expect(screen.getByText('INC0000001')).toBeInTheDocument();
    expect(screen.getByText('Network issue in HQ')).toBeInTheDocument();
    expect(screen.getByText('December 12, 2016')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('displays full description in a tooltip', async () => {
    const user = userEvent.setup();

    render(
      <table>
        <tbody>
          <IncidentsTableRow data={mockData} />
        </tbody>
      </table>,
    );

    const tooltipTarget = screen.getByText('Network issue in HQ');
    await user.hover(tooltipTarget);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      mockData.description,
    );

    await user.unhover(tooltipTarget);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('opens incident URL in new tab when icon is clicked', () => {
    const windowOpenMock = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    render(
      <table>
        <tbody>
          <IncidentsTableRow data={mockData} />
        </tbody>
      </table>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(windowOpenMock).toHaveBeenCalledWith(
      expect.stringContaining('incident.do'),
      '_blank',
    );

    windowOpenMock.mockRestore();
  });
});
