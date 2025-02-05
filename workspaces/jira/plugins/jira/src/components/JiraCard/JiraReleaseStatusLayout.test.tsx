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
import '@testing-library/jest-dom';
import { Issue } from '../../types';
import { JiraStatusLayout } from './JiraStatusLayout';

jest.mock('../LatestUpateCard', () => ({
  JiraUpdatesContent: jest.fn(() => <div>Mocked JiraUpdatesContent</div>),
}));

jest.mock('../JiraChartCard/JiraChartContent', () => ({
  JiraChartContent: jest.fn(() => <div>Mocked JiraChartContent</div>),
}));

jest.mock('../JiraIssueBreakDownCard/JiraStatusBreakDownCard', () => ({
  JiraStatusBreakDownCard: jest.fn(() => (
    <div>Mocked JiraStatusBreakDownCard</div>
  )),
}));

describe('JiraStatusLayout', () => {
  it('should render the issue breakdown content', () => {
    render(
      <JiraStatusLayout
        jiraEpic="PROJECT-123"
        jiraEpicSummary="Jira Summary"
        loading={false}
        issues={['PROJECT-123']}
        projectKey="PROJECT-123"
        issuesBreakdowns={new Map()}
        jiraBreakdownTodoStatus="To Do"
        jiraBreakdownInProgressStatus="In Progress"
        jiraBreakdownBlockStatus="Blocked"
        jiraBreakdownDoneStatus="Done"
      />,
    );

    expect(
      screen.getByText(content => {
        return content.startsWith('Mocked JiraStatusBreakDownCard');
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Review Tasks')).toBeInTheDocument();
  });

  it('should render with an error message when no issues and not loading', () => {
    render(
      <JiraStatusLayout
        jiraEpic="PROJECT-123"
        jiraEpicSummary="Jira Summary"
        loading={false}
        issues={[]}
        projectKey="PROJECT-123"
        errorMessage="Error Message"
        issuesBreakdowns={new Map()}
        jiraBreakdownTodoStatus="To Do"
        jiraBreakdownInProgressStatus="In Progress"
        jiraBreakdownBlockStatus="Blocked"
        jiraBreakdownDoneStatus="Done"
      />,
    );

    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });

  it('should render the latest updates content when not loading', () => {
    render(
      <JiraStatusLayout
        jiraEpic="PROJECT-123"
        jiraEpicSummary="Jira Summary"
        loading={false}
        issues={['ISSUE-1']}
        projectKey="PROJECT-123"
        issuesBreakdowns={new Map()}
        jiraBreakdownTodoStatus="To Do"
        jiraBreakdownInProgressStatus="In Progress"
        jiraBreakdownBlockStatus="Blocked"
        jiraBreakdownDoneStatus="Done"
      />,
    );

    expect(screen.getByText('Latest Updates')).toBeInTheDocument();
    expect(screen.getByText('Mocked JiraUpdatesContent')).toBeInTheDocument();
  });

  it('should render JiraChartContent with correct props', () => {
    render(
      <JiraStatusLayout
        jiraEpic="PROJECT-123"
        jiraEpicSummary="Jira Summary"
        loading={false}
        issues={['PROJECT-123']}
        projectKey="PROJECT-123"
        issuesBreakdowns={new Map()}
        jiraBreakdownTodoStatus="To Do"
        jiraBreakdownInProgressStatus="In Progress"
        jiraBreakdownBlockStatus="Blocked"
        jiraBreakdownDoneStatus="Done"
      />,
    );

    expect(screen.getByText('Mocked JiraChartContent')).toBeInTheDocument();
  });

  it('should render JiraChartContent with issue breakdown data', () => {
    const issuesBreakdowns = new Map<string, Issue[]>([
      [
        'Doc Review',
        [
          {
            id: '1',
            self: '',
            key: 'APSAPITEST-1',
            summary: 'Documentation Review',
            assignee: 'abc',
            labels: ['APIRP-DocumentationReview'],
            issuetype: 'Task',
            status: {
              name: 'Done',
              id: '2',
            },
            timespent: '0',
            updated: '',
            created: '',
            subtasks: [],
          },
        ],
      ],
    ]);

    render(
      <JiraStatusLayout
        jiraEpic="PROJECT-123"
        jiraEpicSummary="Jira Summary"
        loading={false}
        issues={['PROJECT-123']}
        projectKey="PROJECT-123"
        issuesBreakdowns={issuesBreakdowns}
        jiraBreakdownTodoStatus="To Do"
        jiraBreakdownInProgressStatus="In Progress"
        jiraBreakdownBlockStatus="Blocked"
        jiraBreakdownDoneStatus="Done"
      />,
    );

    expect(screen.getByText('Mocked JiraChartContent')).toBeInTheDocument();
  });
});
