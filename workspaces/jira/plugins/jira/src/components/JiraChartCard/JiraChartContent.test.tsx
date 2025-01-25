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
import { JiraChartContent } from './JiraChartContent';

jest.mock('@backstage/core-components', () => ({
  GaugeCard: jest.fn(({ title, subheader, progress, getColor }) => (
    <div data-testid="gauge-card">
      <h2>{title}</h2>
      <h3>{subheader}</h3>
      <p>{progress}</p>
      <p>{getColor()}</p>
    </div>
  )),
}));

const issuesBreakdown: Map<string, Issue[]> = new Map([
  [
    'Marketing',
    [
      {
        id: 'Issue-1',
        self: 'https://jira.autodesk.com/rest/api/2/issue/Issue-1',
        key: 'Issue-1',
        summary: 'Marketing Issue',
        assignee: 'abc',
        labels: ['APIRP-Marketing'],
        issuetype: 'Task',
        status: {
          self: 'https://jira.autodesk.com/rest/api/2/status/100',
          description: '',
          iconUrl:
            'https://jira.autodesk.com/images/icons/statuses/generic.png',
          name: 'To Do',
          id: '1000',
        },
        timespent: '0',
        created: '2024-09-30T00:00:00.000Z',
        updated: '2024-09-30T00:00:00.000Z',
        subtasks: [],
      },
    ],
  ],
  [
    'Doc Review',
    [
      {
        id: 'Issue-4',
        self: 'https://jira.autodesk.com/rest/api/2/issue/Issue-1',
        key: 'Issue-4',
        summary: 'Documentation Review Issue',
        assignee: 'abc',
        labels: ['APIRP-DocumentationReview'],
        issuetype: 'Task',
        status: {
          self: 'https://jira.autodesk.com/rest/api/2/status/100',
          description: '',
          iconUrl:
            'https://jira.autodesk.com/images/icons/statuses/generic.png',
          name: 'Blocked',
          id: '1000',
        },
        timespent: '0',
        updated: '2024-09-30T00:00:00.000Z',
        created: '2024-09-30T00:00:00.000Z',
        subtasks: [],
      },
    ],
  ],
  [
    'API Review',
    [
      {
        id: 'Issue-2',
        self: 'https://jira.autodesk.com/rest/api/2/issue/Issue-2',
        key: 'Issue-3',
        summary: 'Documentation API Review Issue',
        assignee: 'abc',
        labels: ['APIRP-DocAPIReview'],
        issuetype: 'Task',
        status: {
          self: 'https://jira.autodesk.com/rest/api/2/status/100',
          description: '',
          iconUrl:
            'https://jira.autodesk.com/images/icons/statuses/generic.png',
          name: 'Testing',
          id: '1000',
        },
        timespent: '0',
        updated: '2024-09-30T00:00:00.000Z',
        created: '2024-09-30T00:00:00.000Z',
        subtasks: [],
      },
      {
        id: 'Issue-3',
        self: 'https://jira.autodesk.com/rest/api/2/issue/Issue-1',
        key: 'Issue-3',
        summary: 'Devloper Advoctaes API Review Issue',
        assignee: 'abc',
        labels: ['APIRP-DevAdvAPIReview'],
        issuetype: 'Task',
        status: {
          self: 'https://jira.autodesk.com/rest/api/2/status/100',
          description: '',
          iconUrl:
            'https://jira.autodesk.com/images/icons/statuses/generic.png',
          name: 'In Progress',
          id: '1000',
        },
        timespent: '0',
        updated: '2024-09-30T00:00:00.000Z',
        created: '2024-09-30T00:00:00.000Z',
        subtasks: [],
      },
    ],
  ],
]);

describe('JiraChartContent', () => {
  it('renders "No Data Available" when issuesBreakdowns and statuses are missing', () => {
    render(
      <JiraChartContent
        issuesBreakdowns={undefined}
        jiraBreakdownTodoStatus={undefined}
        jiraBreakdownInProgressStatus={undefined}
        jiraBreakdownBlockStatus={undefined}
        jiraBreakdownDoneStatus={undefined}
      />,
    );

    expect(screen.getByText(/No activities found./i)).toBeInTheDocument();
  });

  it('renders GaugeCard components correctly when issuesBreakdowns and statuses are provided', () => {
    render(
      <JiraChartContent
        issuesBreakdowns={issuesBreakdown}
        jiraBreakdownTodoStatus="To Do"
        jiraBreakdownInProgressStatus="In Progress"
        jiraBreakdownBlockStatus="Blocked"
        jiraBreakdownDoneStatus="Done"
      />,
    );

    expect(screen.getAllByTestId('gauge-card')).toHaveLength(3);

    // Check for Marketing card
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText(0)).toBeInTheDocument();

    // Check for Doc Review card
    expect(screen.getByText('Doc Review')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText(1)).toBeInTheDocument();

    // Check for API Review card
    expect(screen.getByText('API Review')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText(0.5)).toBeInTheDocument();
  });
});
