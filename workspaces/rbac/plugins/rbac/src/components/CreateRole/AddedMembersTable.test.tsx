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

import { Table } from '@backstage/core-components';

import { render, screen } from '@testing-library/react';

import { AddedMembersTable } from './AddedMembersTable';
import { SelectedMember } from './types';

const setFieldValueMock = jest.fn();

const selectedMembers: SelectedMember[] = [
  {
    id: 'test-1',
    label: 'User 1',
    etag: 'etag-1',
    type: 'User',
    ref: 'user:default/user-1',
  },
  {
    id: 'test-2',
    label: 'Group 1',
    etag: 'etag-2',
    type: 'Group',
    ref: 'group:default/test-2',
  },
];

jest.mock('@backstage/core-components');
const mockedTable = Table as jest.MockedFunction<typeof Table>;
mockedTable.mockImplementation(
  jest.requireActual('@backstage/core-components').Table,
);

describe('AddedMembersTable component', () => {
  it('renders with empty content when no selected members', () => {
    render(
      <AddedMembersTable
        selectedMembers={[]}
        setFieldValue={setFieldValueMock}
      />,
    );

    expect(
      screen.queryByText('No users and groups selected'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Selected users and groups appear here.'),
    ).toBeInTheDocument();
  });

  it('renders with selected members and correct title', () => {
    render(
      <AddedMembersTable
        selectedMembers={selectedMembers}
        setFieldValue={setFieldValueMock}
      />,
    );

    expect(mockedTable).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '1 group, 1 user',
        data: selectedMembers,
      }),
      expect.anything(),
    );
  });
});
