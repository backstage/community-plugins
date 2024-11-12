/*
 * Copyright 2024 The Backstage Authors
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
import '@testing-library/jest-dom';
import DenseTable from './DenseTable';

describe('DenseTable component', () => {
  const mockIssues = [
    {
      id: '1',
      key: 'ISSUE-1',
      fields: {
        summary: 'First issue summary',
        status: { name: 'Open' },
        assignee: { displayName: 'John Doe' },
        reporter: { displayName: 'Jane Smith' },
      },
    },
    {
      id: '2',
      key: 'ISSUE-2',
      fields: {
        summary: 'Second issue summary',
        status: { name: 'In Progress' },
        assignee: { displayName: 'Alice Brown' },
        reporter: { displayName: 'Bob Johnson' },
      },
    },
  ];

  it('should render without crashing', () => {
    const { getByText } = render(<DenseTable issues={mockIssues} />);
    expect(getByText('Jira Issues')).toBeInTheDocument();
  });

  it('should render the correct number of issues', () => {
    const { getByText } = render(<DenseTable issues={mockIssues} />);

    expect(getByText('ISSUE-1')).toBeInTheDocument();
    expect(getByText('First issue summary')).toBeInTheDocument();
    expect(getByText('Open')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();

    expect(getByText('ISSUE-2')).toBeInTheDocument();
    expect(getByText('Second issue summary')).toBeInTheDocument();
    expect(getByText('In Progress')).toBeInTheDocument();
    expect(getByText('Alice Brown')).toBeInTheDocument();
  });
});
