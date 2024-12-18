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

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { MemberEntity } from '../../types';
import { AddMembersForm } from './AddMembersForm';

const membersData: {
  members: MemberEntity[];
  loading: boolean;
  error: Error;
} = {
  members: [
    {
      metadata: { name: '', etag: '' },
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      spec: {},
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      spec: {},
      metadata: { name: 'test user1', etag: 'test user1' },
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      spec: {},
      metadata: { name: 'test user2', etag: 'test user2' },
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      spec: {},
      metadata: { name: 'test user3', etag: 'test user3' },
    },
  ],
  loading: false,
  error: { name: '', message: '' },
};
const selectedMembers = [
  {
    id: 'test user1',
    label: 'test user1',
    etag: 'test user1',
    type: 'User',
    members: 1,
    ref: 'user:default/test user1',
  },
];

describe('AddMembersForm', () => {
  const mockSetFieldValue = jest.fn();

  it('displays error message when membersData.error is provided', async () => {
    const mockError = new Error('Failed to fetch');
    render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={{ members: [], loading: false, error: mockError }}
        setFieldValue={mockSetFieldValue}
      />,
    );

    expect(
      screen.getByText(`Error fetching user and groups: ${mockError.message}`),
    ).toBeInTheDocument();
  });

  it('updates search field on input change', async () => {
    render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={{
          members: [],
          loading: false,
          error: { name: '', message: '' },
        }}
        setFieldValue={mockSetFieldValue}
      />,
    );

    const input = screen.getByPlaceholderText(
      'Search by user name or group name',
    );
    await userEvent.type(input, 'John Doe');

    expect(input).toHaveValue('John Doe');
  });

  it('allows selecting multiple members from the dropdown', async () => {
    const user = userEvent.setup();

    const { getByPlaceholderText, findByText } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );

    // Open the dropdown
    const memberOptions = getByPlaceholderText(
      'Search by user name or group name',
    );
    await user.click(memberOptions);
    screen.debug();
    // Select the first member
    const memberOption1 = await findByText('test user1');
    await user.click(memberOption1);

    // Open the dropdown and Select the second member
    await user.click(memberOptions);
    screen.debug();
    const memberOption2 = await screen.findByText('test user2');

    await user.click(memberOption2);
    await waitFor(() => {
      expect(mockSetFieldValue).toHaveBeenCalledWith(
        'selectedMembers',
        expect.arrayContaining([
          expect.objectContaining({ label: 'test user1' }),
          expect.objectContaining({ label: 'test user2' }),
        ]),
      );
    });
  });

  test('clears search when HighlightOffIcon is clicked', () => {
    const { getByPlaceholderText, getByLabelText } = render(
      <AddMembersForm
        selectedMembers={selectedMembers}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );

    const input = getByPlaceholderText('Search by user name or group name');
    fireEvent.change(input, { target: { value: 'User 1' } });
    expect(input).toHaveValue('User 1');
    const clearButton = getByLabelText('clear search');
    fireEvent.click(clearButton);
    expect(input).toHaveValue('');
  });
  it('filters members as the user types in the search input', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );

    await user.type(
      getByPlaceholderText('Search by user name or group name'),
      'er1',
    );

    const elements = screen.getAllByTestId('test user1');
    const combinedText = elements.map(el => el.textContent).join('');
    expect(combinedText).toBe('test user1');
  });

  it('updates the selected member and calls setFieldValue on selection', async () => {
    const user = userEvent.setup();

    const { getByPlaceholderText, findByText } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );

    await user.click(getByPlaceholderText('Search by user name or group name'));

    const memberOption = await findByText('test user2');
    const listboxElement = memberOption.closest('ul');

    if (!listboxElement) {
      throw new Error('Unable to find the listbox element.');
    }

    const listbox = within(listboxElement);
    await user.click(listbox.getByText(/test user2/));

    await waitFor(() => {
      expect(mockSetFieldValue).toHaveBeenCalledWith(
        'selectedMembers',
        expect.arrayContaining([
          expect.objectContaining({
            label: 'test user2',
          }),
        ]),
      );
    });
  });

  it('displays an error message if selectedMembersError is provided', () => {
    const selectedMembersError = 'Error selecting members';

    render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={{
          members: [],
          loading: false,
          error: { name: 'MemberError', message: '' },
        }}
        setFieldValue={mockSetFieldValue}
        selectedMembersError={selectedMembersError}
      />,
    );

    expect(screen.getByText(selectedMembersError)).toBeInTheDocument();
  });

  it('is able to clear the search input after selection', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, findByText } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );

    await user.click(getByPlaceholderText('Search by user name or group name'));

    const memberOption = await findByText('test user1');
    const listboxElement = memberOption.closest('ul');

    if (!listboxElement) {
      throw new Error('Unable to find the listbox element.');
    }

    const listbox = within(listboxElement);

    // user selected one option
    await user.click(listbox.getByText(/test user1/));
    // user cleared the search input
    await user.clear(getByPlaceholderText('Search by user name or group name'));
    // user unfocused the search input
    await user.click(document.body);

    // check if the selected member is cleared in search input
    expect(
      getByPlaceholderText('Search by user name or group name'),
    ).toHaveValue('');
  });
});
