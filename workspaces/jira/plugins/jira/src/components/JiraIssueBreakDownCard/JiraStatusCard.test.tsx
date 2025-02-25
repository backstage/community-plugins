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
import { Issue } from '../../types';
import { JiraStatusCard } from './JiraStatusCard';

jest.mock('@backstage/core-components', () => ({
  ErrorPanel: jest.fn(() => <div>ErrorPanel Mock</div>),
  LinearGauge: jest.fn(() => <div>LinearGauge Mock</div>),
}));

jest.mock('./JiraStatusTable', () => ({
  JiraStatusTable: jest.fn(() => <div>JiraStatusTable Mock</div>),
}));

jest.mock('../../utils', () => ({
  countStatuses: jest.fn(() => ({
    todo: 2,
    inProgress: 1,
    blocked: 0,
    done: 1,
  })),
  getStatusAndProgress: jest.fn(() => ({
    color: 'green',
    progress: 0.5,
  })),
}));

describe('JiraStatusCard', () => {
  const defaultProps = {
    title: 'Jira Status',
    jiraBreakdownTodoStatus: 'To Do',
    jiraBreakdownInProgressStatus: 'In Progress',
    jiraBreakdownBlockStatus: 'Blocked',
    jiraBreakdownDoneStatus: 'Done',
  };

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
  ];

  it('renders correctly with issues and progress', () => {
    render(
      <JiraStatusCard {...defaultProps} issues={mockIssues} loading={false} />,
    );

    expect(screen.getByText('Jira Status')).toBeInTheDocument();

    expect(screen.getByText('LinearGauge Mock')).toBeInTheDocument();

    expect(screen.getByText('50%')).toBeInTheDocument();

    expect(screen.getByText('JiraStatusTable Mock')).toBeInTheDocument();
  });

  it('renders ErrorPanel when required data is missing', () => {
    render(<JiraStatusCard {...defaultProps} issues={undefined} loading />);

    expect(screen.getByText('ErrorPanel Mock')).toBeInTheDocument();
  });

  it('renders JiraStatusTable in loading state', () => {
    render(<JiraStatusCard {...defaultProps} issues={mockIssues} loading />);

    expect(screen.getByText('JiraStatusTable Mock')).toBeInTheDocument();
  });
});
