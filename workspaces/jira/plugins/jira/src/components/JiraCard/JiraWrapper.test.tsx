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
import { render } from '@testing-library/react';
import { useJiraDetails } from '../../hooks';
import { useJiraInfo } from '../../hooks/useJiraInfo';
import { JiraWrapper } from './JiraWrapper';
import { JiraReleaseStatusLayout } from './JiraReleaseStatusLayout';

jest.mock('../../hooks/useJiraDetails');
jest.mock('../../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(() => new Map()), // Mocking useAppConfig to return an empty Map
}));
jest.mock('../../hooks/useJiraInfo', () => ({
  useJiraInfo: jest.fn(() => ({
    issues: [{ id: '1', title: 'Issue 1' }],
    loading: false,
    error: null,
  })),
}));
jest.mock('./JiraReleaseStatusLayout', () => ({
  JiraReleaseStatusLayout: jest.fn(() => (
    <div>Mocked JiraReleaseStatusLayout</div>
  )),
}));

describe('JiraWrapper', () => {
  const mockUseJiraStories = useJiraDetails as jest.Mock;
  const mockUseJiraInfo = useJiraInfo as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('renders JiraReleaseStatusLayout with correct issues and projectKey when data is loaded', () => {
    const mockIssues = [
      { id: '1', title: 'Issue 1' },
      { id: '2', title: 'Issue 2' },
    ];
    const mockProjectKey = 'PROJECT-123';

    mockUseJiraStories.mockReturnValue({
      issues: mockIssues,
      projectKey: mockProjectKey,
      loading: false,
      error: null,
    });

    mockUseJiraInfo.mockReturnValue({
      issues: mockIssues,
      loading: false,
    });

    render(<JiraWrapper jiraEpic="ABC-123" />);

    expect(JiraReleaseStatusLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        issues: mockIssues,
        projectKey: 'ABC',
        loading: false,
        errorMessage: null,
      }),
      expect.anything(),
    );
  });

  it('passes correct props to JiraReleaseStatusLayout when loading', () => {
    mockUseJiraStories.mockReturnValue({
      issues: [],
      projectKey: 'PROJECT-456',
      loading: true,
      error: null,
    });

    mockUseJiraInfo.mockReturnValue({
      issues: [],
      loading: true,
    });

    render(<JiraWrapper jiraEpic="XYZ-456" />);

    const callsWithLoading = (
      JiraReleaseStatusLayout as jest.Mock
    ).mock.calls.filter(call => call[0].loading === true);

    expect(callsWithLoading.length).toBeGreaterThan(0);
    expect(callsWithLoading[0][0].issues).toEqual([]);
    expect(callsWithLoading[0][0].projectKey).toEqual('XYZ');
  });

  it('renders JiraReleaseStatusLayout with errorMessage when error occurs', () => {
    const mockError = 'Error Message';

    mockUseJiraStories.mockReturnValue({
      issues: [],
      projectKey: 'INVALID',
      loading: false,
      error: mockError,
    });

    mockUseJiraInfo.mockReturnValue({
      issues: [],
      loading: false,
      error: mockError,
    });

    render(<JiraWrapper jiraEpic="INVALID-789" />);

    expect(JiraReleaseStatusLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        issues: [],
        projectKey: 'INVALID',
        loading: false,
        errorMessage: mockError,
      }),
      expect.anything(),
    );
  });

  it('correctly handles jiraBreakdownTodoStatus and other breakdown statuses', () => {
    mockUseJiraStories.mockReturnValue({
      issues: [],
      projectKey: 'ABC',
      loading: false,
      error: null,
    });

    mockUseJiraInfo.mockReturnValue({
      issues: [],
      loading: false,
    });

    render(
      <JiraWrapper
        jiraEpic="ABC-123"
        jiraBreakdownTodoStatus="To Do"
        jiraBreakdownInProgressStatus="In Progress"
        jiraBreakdownBlockStatus="Blocked"
        jiraBreakdownDoneStatus="Done"
      />,
    );

    expect(JiraReleaseStatusLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        jiraBreakdownTodoStatus: 'To Do',
        jiraBreakdownInProgressStatus: 'In Progress',
        jiraBreakdownBlockStatus: 'Blocked',
        jiraBreakdownDoneStatus: 'Done',
      }),
      expect.anything(),
    );
  });

  it('handles empty breakdown statuses gracefully', () => {
    mockUseJiraStories.mockReturnValue({
      issues: [],
      loading: false,
      error: null,
    });

    mockUseJiraInfo.mockReturnValue({
      issues: [],
      loading: false,
    });

    render(<JiraWrapper jiraEpic="XYZ-456" />);

    expect(JiraReleaseStatusLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        jiraBreakdownTodoStatus: undefined,
        jiraBreakdownInProgressStatus: undefined,
        jiraBreakdownBlockStatus: undefined,
        jiraBreakdownDoneStatus: undefined,
      }),
      expect.anything(),
    );
  });
});
