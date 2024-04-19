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

import { ErrorCell } from './ErrorCell';
import React from 'react';
import mockIssue from '../../api/mock/sentry-issue-mock.json';
import { renderInTestApp } from '@backstage/test-utils';

describe('Sentry error cell component', () => {
  it('should render a link that lead to Sentry', async () => {
    const testIssue = {
      ...mockIssue,
      metadata: {
        type: 'Exception',
        value: 'exception was thrown',
      },
      count: '1',
      userCount: 2,
      permalink: 'http://example.com',
    };
    const cell = await renderInTestApp(<ErrorCell sentryIssue={testIssue} />);
    const errorType = await cell.findByText('Exception');
    expect(errorType.closest('a')).toHaveAttribute(
      'href',
      'http://example.com',
    );
  });
  it('should render the title if type is not present', async () => {
    const testIssue = {
      ...mockIssue,
      title: 'Exception: Could not load credentials from any providers',
      count: '1',
      metadata: {},
      userCount: 2,
      permalink: 'http://example.com',
    };
    const cell = await renderInTestApp(<ErrorCell sentryIssue={testIssue} />);
    const errorType = await cell.findByText('Exception: Could not load cr...');
    expect(errorType.closest('a')).toHaveAttribute(
      'href',
      'http://example.com',
    );
  });
});
