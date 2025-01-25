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

import React from 'react';
import { render, screen } from '@testing-library/react';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { Issue } from '../../types';
import { JiraStatusTable } from './JiraStatusTable';

jest.mock('@backstage/core-components', () => ({
  ErrorPanel: jest.fn(() => <div>ErrorPanel Mock</div>),
  Table: jest.fn(() => <div>Table Mock</div>),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('JiraStatusTable', () => {
  beforeEach(() => {
    (useApi as jest.Mock).mockImplementation(ref => {
      if (ref === appThemeApiRef) {
        return {
          getActiveThemeId: () => 'adsk-dark',
        };
      }
      return {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockIssues: Issue[] = [
    {
      id: '1',
      self: 'http://mock-jira-url/ISSUE-1',
      key: 'ISSUE-1',
      summary: 'Test Issue 1',
      assignee: 'John Doe',
      labels: ['bug'],
      issuetype: 'Task',
      status: { name: 'To Do' },
      timespent: '3600',
      created: '2023-10-01T12:00:00Z',
      updated: '2023-10-02T12:00:00Z',
    },
  ];
  const defaultProps = {
    title: 'Jira Status',
  };

  it('renders table when issues are present', () => {
    render(
      <JiraStatusTable {...defaultProps} issues={mockIssues} loading={false} />,
    );

    expect(screen.getByText('Table Mock')).toBeInTheDocument();
  });

  it('renders ErrorPanel when no issues are present', () => {
    render(<JiraStatusTable {...defaultProps} issues={[]} loading />);

    expect(screen.getByText('ErrorPanel Mock')).toBeInTheDocument();
  });

  it('renders Table in loading state when loading is true', () => {
    render(<JiraStatusTable {...defaultProps} issues={mockIssues} loading />);

    expect(screen.getByText('Table Mock')).toBeInTheDocument();
  });
});
