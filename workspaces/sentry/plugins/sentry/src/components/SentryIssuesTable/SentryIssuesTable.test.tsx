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

import React from 'react';
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
      },
    ];
    const table = await renderInTestApp(
      <SentryIssuesTable
        sentryIssues={issues}
        statsFor="24h"
        tableOptions={{
          padding: 'dense',
          paging: true,
          search: false,
          pageSize: 5,
        }}
      />,
    );
    expect(await table.findByText('Error')).toBeInTheDocument();
    expect(await table.findByText('Graph')).toBeInTheDocument();
    expect(await table.findByText('First seen')).toBeInTheDocument();
    expect(await table.findByText('Last seen')).toBeInTheDocument();
    expect(await table.findByText('Events')).toBeInTheDocument();
    expect(await table.findByText('Users')).toBeInTheDocument();
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
      },
    ];
    const table = await renderInTestApp(
      <SentryIssuesTable
        sentryIssues={issues}
        statsFor="24h"
        tableOptions={{
          padding: 'dense',
          paging: true,
          search: false,
          pageSize: 5,
        }}
      />,
    );
    expect(await table.findByText('Exception')).toBeInTheDocument();
    expect(await table.findByText('exception was thrown')).toBeInTheDocument();
    expect(await table.findByText('101')).toBeInTheDocument();
    expect(await table.findByText('202')).toBeInTheDocument();
  });
  it('should render statsFor in table subtitle', async () => {
    const issues: SentryIssue[] = [
      {
        ...mockIssue,
        metadata: {
          type: 'Exception',
          value: 'exception was thrown',
        },
        count: '101',
        userCount: 202,
      },
    ];
    const table = await renderInTestApp(
      <SentryIssuesTable
        sentryIssues={issues}
        statsFor="24h"
        tableOptions={{
          padding: 'dense',
          paging: true,
          search: false,
          pageSize: 5,
        }}
      />,
    );
    expect(await table.findByText('Stats for 24h')).toBeInTheDocument();
  });
});
