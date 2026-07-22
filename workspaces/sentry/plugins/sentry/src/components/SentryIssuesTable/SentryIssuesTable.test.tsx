/*
 * Copyright 2020 The Backstage Authors
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

import SentryIssuesTable from './SentryIssuesTable';
import { SentryIssue } from '../../api';
import mockIssue from '../../api/mock/sentry-issue-mock.json';
import { renderInTestApp } from '@backstage/test-utils';
import { DateTime } from 'luxon';

describe('SentryIssuesTable', () => {
  it('should render headers in a table', async () => {
    const issues: SentryIssue[] = [
      {
        ...mockIssue,
        metadata: {
          type: 'Exception',
          value: 'exception was thrown',
        },
        count: '1',
        userCount: 2,
        lastSeen: DateTime.now().toISO()!,
        firstSeen: DateTime.now().minus({ days: 7 }).toISO()!,
      },
    ];
    const table = await renderInTestApp(
      <SentryIssuesTable
        sentryIssues={issues}
        statsFor="24h"
        tableOptions={{
          pageSize: 5,
        }}
      />,
    );
    // Check for table headers by text content
    expect(table.getByText('Error')).toBeInTheDocument();
    expect(table.getByText('Graph')).toBeInTheDocument();
    expect(table.getByText('First seen')).toBeInTheDocument();
    expect(table.getByText('Last seen')).toBeInTheDocument();
    expect(table.getByText('Events')).toBeInTheDocument();
    expect(table.getByText('Users')).toBeInTheDocument();
  });
  it('should render values in a table', async () => {
    const issues: SentryIssue[] = [
      {
        ...mockIssue,
        metadata: {
          type: 'Exception',
          value: 'exception was thrown',
        },
        count: '101',
        userCount: 202,
        lastSeen: DateTime.now().toISO()!,
        firstSeen: DateTime.now().minus({ days: 7 }).toISO()!,
      },
    ];
    const table = await renderInTestApp(
      <SentryIssuesTable
        sentryIssues={issues}
        statsFor="24h"
        tableOptions={{
          pageSize: 5,
        }}
      />,
    );
    expect(await table.findByText('Exception')).toBeInTheDocument();
    expect(await table.findByText('exception was thrown')).toBeInTheDocument();
    expect(await table.findByText('101')).toBeInTheDocument();
    expect(await table.findByText('202')).toBeInTheDocument();
  });
});
