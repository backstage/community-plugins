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

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import { JiraLocalComponent } from './JiraLocalComponent';

// Mock Jira API data
const mockIssues = [
  {
    key: 'JIRA-1',
    fields: {
      summary: 'Test issue 1',
      created: new Date().toISOString(),
      project: { key: 'JIRA' },
    },
  },
  {
    key: 'JIRA-2',
    fields: {
      summary: 'Test issue 2',
      created: new Date().toISOString(),
      project: { key: 'JIRA' },
    },
  },
];

// Mock the useApi hook and createApiRef
jest.mock('@backstage/core-plugin-api', () => {
  const actual = jest.requireActual('@backstage/core-plugin-api');
  return {
    ...actual,
    useApi: jest.fn(),
    createApiRef: jest.fn().mockImplementation(() => ({
      id: 'plugin.jira.service',
    })),
  };
});

describe('JiraLocalComponent', () => {
  beforeEach(() => {
    // Mock the Jira API response
    (useApi as jest.Mock).mockReturnValue({
      listIssues: jest.fn().mockResolvedValue({
        issues: mockIssues,
        total: 10,
      }),
    });
  });

  it.skip('should handle pagination correctly', async () => {
    render(<JiraLocalComponent />);

    const nextPageButton = await screen.findByRole('button', { name: /chevronright/i });

    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(nextPageButton);

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
