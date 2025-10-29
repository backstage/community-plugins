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
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { MemberEntity } from '../../types';
import { AddMembersForm } from './AddMembersForm';

jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => 'en',
}));

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

    const autocompleteInput = screen
      .getByTestId('users-and-groups-text-field')
      .querySelector('input');
    if (!autocompleteInput) {
      throw new Error('Input field not found');
    }
    await userEvent.type(autocompleteInput, 'John Doe');

    expect(autocompleteInput).toHaveValue('John Doe');
  });

  it('allows selecting multiple members from the dropdown', async () => {
    const user = userEvent.setup();

    const { findByText, getByRole, getByTestId } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );
    const autocompleteInput = getByTestId(
      'users-and-groups-text-field',
    ).querySelector('input');
    if (!autocompleteInput) {
      throw new Error('Input field not found');
    }
    // Open the dropdown
    await user.click(autocompleteInput);

    // Assert the dropdown listbox is displayed
    const memberOptions = getByRole('listbox');
    expect(memberOptions).toBeInTheDocument();
    // Select the first member
    const memberOption1 = await findByText('test user1');
    await user.click(memberOption1);

    // Select the second member
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

  it('clears search when HighlightOffIcon is clicked', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(
      <AddMembersForm
        selectedMembers={selectedMembers}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );
    const autocompleteInput = screen
      .getByTestId('users-and-groups-text-field')
      .querySelector('input');
    if (!autocompleteInput) {
      throw new Error('Input field not found');
    }
    await userEvent.type(autocompleteInput, 'John Doe');
    expect(autocompleteInput).toHaveValue('John Doe');

    const clearButton = getByLabelText('clear search');
    await user.click(clearButton);
    expect(autocompleteInput).toHaveValue('');
  });
  it('filters members as the user types in the search input', async () => {
    const user = userEvent.setup();
    const { getByTestId, getAllByTestId } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );
    const autocompleteInput = getByTestId(
      'users-and-groups-text-field',
    ).querySelector('input');
    if (!autocompleteInput) {
      throw new Error('Input field not found');
    }
    await user.type(autocompleteInput, 'er1');

    const elements = getAllByTestId('test user1');
    const combinedText = elements.map(el => el.textContent).join('');
    expect(combinedText).toBe('test user1');
  });

  it('updates the selected member and calls setFieldValue on selection', async () => {
    const user = userEvent.setup();

    const { findByText, getByTestId } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );
    const autocompleteInput = getByTestId(
      'users-and-groups-text-field',
    ).querySelector('input');
    if (!autocompleteInput) {
      throw new Error('Input field not found');
    }
    await user.click(autocompleteInput);

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

  it('keeps the search input after each selection', async () => {
    const user = userEvent.setup();

    const { findByText, getByRole } = render(
      <AddMembersForm
        selectedMembers={[]}
        membersData={membersData}
        setFieldValue={mockSetFieldValue}
      />,
    );
    const autocompleteInput = screen
      .getByTestId('users-and-groups-text-field')
      .querySelector('input');
    if (!autocompleteInput) {
      throw new Error('Input field not found');
    }
    // Open the dropdown
    user.click(autocompleteInput);

    await userEvent.type(autocompleteInput, 'er1');
    const memberOptions = getByRole('listbox');
    await user.click(memberOptions);
    const memberOption1 = await findByText('er1');
    await user.click(memberOption1);
    expect(autocompleteInput).toHaveValue('er1');
  });
});
