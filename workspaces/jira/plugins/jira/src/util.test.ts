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

import { Issue } from './types';
import {
  countStatuses,
  extractBreakDownData,
  extractLabelProgress,
  getStatusAndProgress,
  jiraStatusColor,
  jiraStatusProgress,
} from './utils';

describe('extractBreakDownData', () => {
  const issues: Issue[] = [
    {
      id: '1',
      key: 'KEY-1',
      self: 'url',
      summary: 'Issue 1',
      assignee: 'user1',
      labels: ['Marketing'],
      issuetype: 'Task',
      status: { name: 'To Do' },
      timespent: '0',
      updated: '',
      created: '',
    },
  ];

  const filteredViews = new Map<string, string[]>([
    ['Marketing', ['Marketing']],
  ]);

  it('categorizes issues based on their labels', () => {
    const result = extractBreakDownData('Epic-Key', issues, filteredViews);
    expect(result.has('Marketing')).toBe(true);
    expect(result.get('Marketing')).toHaveLength(1);
  });
});

describe('countStatuses', () => {
  it('counts the correct number of statuses', () => {
    const statuses = ['To Do', 'In Progress', 'Blocked'];
    const result = countStatuses(
      statuses,
      'To Do',
      'In Progress',
      'Blocked',
      'Done',
    );
    expect(result.get('To Do')).toBe(1);
    expect(result.get('In Progress')).toBe(1);
    expect(result.get('Blocked')).toBe(1);
  });
});

describe('getStatusAndProgress', () => {
  it('returns blocked status when there is at least one "Blocked" issue', () => {
    const counts = new Map([['Blocked', 1]]);
    const total = 3;
    const result = getStatusAndProgress(counts, total);
    expect(result.status).toBe('Blocked');
    expect(result.color).toBe(jiraStatusColor.blocked);
    expect(result.progress).toBe(jiraStatusProgress.blocked);
  });

  it('returns done status when all issues are done', () => {
    const counts = new Map([['Done', 3]]);
    const total = 3;
    const result = getStatusAndProgress(counts, total);
    expect(result.status).toBe('Done');
    expect(result.color).toBe(jiraStatusColor.done);
    expect(result.progress).toBe(jiraStatusProgress.done);
  });

  it('returns in-progress status when there is at least one in-progress issue', () => {
    const counts = new Map([['In Progress', 1]]);
    const result = getStatusAndProgress(counts, 3);
    expect(result.status).toBe('In Progress');
    expect(result.color).toBe(jiraStatusColor.inProgress);
    expect(result.progress).toBe(jiraStatusProgress.inProgress);
  });
});

describe('extractLabelProgress', () => {
  const issuesBreakdowns = new Map<string, Issue[]>([
    [
      'Marketing',
      [
        {
          id: '1',
          key: 'KEY-1',
          self: 'url',
          summary: 'Issue 1',
          assignee: 'user1',
          labels: ['Marketing'],
          issuetype: 'Task',
          status: { name: 'To Do' },
          timespent: '0',
          updated: '',
          created: '',
        },
      ],
    ],
  ]);

  it('extracts label progress correctly', () => {
    const result = extractLabelProgress(
      issuesBreakdowns,
      'To Do',
      'In Progress',
      'Blocked',
      'Done',
    );
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Marketing');
    expect(result[0].status).toBe('To Do');
    expect(result[0].progress).toBe(0);
    expect(result[0].color).toBe(jiraStatusColor.toDo);
  });
});
