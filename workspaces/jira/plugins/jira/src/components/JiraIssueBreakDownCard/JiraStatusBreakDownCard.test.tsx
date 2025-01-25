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

import React, { FC } from 'react';
import { render, screen } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api'; // Ensure correct imports
import { Issue } from '../../types';
import { JiraStatusBreakDownCard } from './JiraStatusBreakDownCard';
import { JiraStatusCard } from './JiraStatusCard';

jest.mock('../../utils', () => ({
  buildJiraUrl: jest.fn(),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  CircularProgress: jest.fn(() => <div>CircularProgress Mock</div>),
}));

jest.mock('./JiraStatusCard', () => ({
  JiraStatusCard: jest.fn(() => <div>JiraStatusCard Mock</div>),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));
const mockConfigApi = {
  getString: jest.fn(key => {
    if (key === 'jira.portalUrl') {
      return 'https://mock-jira-url.com/';
    }
    return '';
  }),
};
(useApi as jest.Mock).mockReturnValue(mockConfigApi);

const mockedJiraStatusCard = JiraStatusCard as jest.MockedFunction<FC<any>>;

describe('JiraStatusBreakDownCard', () => {
  const defaultProps = {
    jiraEpic: 'TEST-123',
    jiraEpicSummary: 'Test Epic Summary',
    jiraBreakdownTodoStatus: 'To Do',
    jiraBreakdownInProgressStatus: 'In Progress',
    jiraBreakdownBlockStatus: 'Blocked',
    jiraBreakdownDoneStatus: 'Done',
    loading: false,
  };

  it('renders empty state when no issuesMap is provided', () => {
    render(<JiraStatusBreakDownCard {...defaultProps} issuesMap={undefined} />);

    expect(
      screen.getByText(content => {
        return content.includes('Test Epic Summary');
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(content => {
        return content.startsWith('Jira Epic');
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('No activities found.')).toBeInTheDocument();
  });

  it('renders empty state when issuesMap is empty', () => {
    render(<JiraStatusBreakDownCard {...defaultProps} issuesMap={new Map()} />);

    expect(
      screen.getByText(content => {
        return content.includes('Test Epic Summary');
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(content => {
        return content.startsWith('Jira Epic');
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('No activities found.')).toBeInTheDocument();
  });

  it('renders JiraStatusCards when issuesMap has data', () => {
    const mockIssuesMap = new Map<string, Issue[]>([
      [
        'To Do',
        [
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
        ],
      ],
      [
        'In Progress',
        [
          {
            id: '2',
            self: 'http://mock-jira-url/ISSUE-2',
            key: 'ISSUE-2',
            summary: 'Test Issue 2',
            assignee: 'Jane Doe',
            labels: ['feature'],
            issuetype: 'Story',
            status: { name: 'In Progress' },
            timespent: '1800',
            created: '2023-10-01T12:00:00Z',
            updated: '2023-10-03T12:00:00Z',
          },
        ],
      ],
    ]);

    render(
      <JiraStatusBreakDownCard {...defaultProps} issuesMap={mockIssuesMap} />,
    );
    expect(screen.queryByText('CircularProgress Mock')).not.toBeInTheDocument();

    expect(mockedJiraStatusCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'To Do',
        jiraBreakdownTodoStatus: 'To Do',
        jiraBreakdownInProgressStatus: 'In Progress',
        jiraBreakdownBlockStatus: 'Blocked',
        jiraBreakdownDoneStatus: 'Done',
      }),
      {},
    );
    expect(mockedJiraStatusCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'In Progress',
        jiraBreakdownTodoStatus: 'To Do',
        jiraBreakdownInProgressStatus: 'In Progress',
        jiraBreakdownBlockStatus: 'Blocked',
        jiraBreakdownDoneStatus: 'Done',
      }),
      {},
    );
  });

  it('renders CircularProgress when loading is true', () => {
    const propsWithLoading = { ...defaultProps, loading: true };
    render(<JiraStatusBreakDownCard {...propsWithLoading} />);
    expect(screen.getByText('CircularProgress Mock')).toBeInTheDocument();
  });
});
