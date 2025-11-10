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
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemberSelectionDialog } from './MemberSelectionDialog';
import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { act } from 'react-dom/test-utils';

let capturedUserSelectionChange: (rows: any[]) => void;
let capturedGroupSelectionChange: (rows: any[]) => void;

jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  Table: (props: any) => {
    if (props.title === 'Select Users') {
      capturedUserSelectionChange = props.onSelectionChange;
    }
    if (props.title === 'Select Groups') {
      capturedGroupSelectionChange = props.onSelectionChange;
    }

    return (
      <div data-testid={`mock-table-${props.title.replace(/\s/g, '')}`}>
        {props.data.map((row: any) => (
          <div data-testid={`row-${row.metadata.name}`} key={row.metadata.name}>
            {row.spec.profile.displayName}
            <span>{row.tableData?.checked ? 'checked' : 'not-checked'}</span>
          </div>
        ))}
      </div>
    );
  },
  Progress: () => <div data-testid="progress" />,
}));

jest.mock('../../utils/create-role-utils', () => ({
  getMembersCount: () => 3,
  getParentGroupsCount: () => 1,
  getChildGroupsCount: () => 2,
}));

const mockUser1: UserEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: { name: 'user1', etag: 'etag-user1', namespace: 'default' },
  spec: { profile: { displayName: 'User One', email: 'user1@example.com' } },
};
const mockUser2: UserEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: { name: 'user2', etag: 'etag-user2', namespace: 'default' },
  spec: { profile: { displayName: 'User Two', email: 'user2@example.com' } },
};

const mockGroup1: GroupEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: { name: 'group1', etag: 'etag-group1', namespace: 'default' },
  spec: { type: 'team', profile: { displayName: 'Group One' }, children: [] },
};

const mockT = (key: string) => key;

const renderDialog = (
  props: Partial<React.ComponentProps<typeof MemberSelectionDialog>>,
) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onApply: jest.fn(),
    initialSelectedMembers: [],
    allUsers: [mockUser1, mockUser2],
    allGroups: [mockGroup1],
    isLoading: false,
    t: mockT as any,
  };
  return render(
    <ThemeProvider theme={lightTheme}>
      <MemberSelectionDialog {...defaultProps} {...props} />
    </ThemeProvider>,
  );
};

describe('MemberSelectionDialog', () => {
  it('shows a loading spinner when isLoading is true', () => {
    renderDialog({ isLoading: true });
    expect(screen.getByTestId('progress')).toBeInTheDocument();
    // The table should not be rendered when loading
    expect(
      screen.queryByTestId('mock-table-SelectUsers'),
    ).not.toBeInTheDocument();
  });

  it('renders the dialog with the "Users" tab active by default', () => {
    renderDialog({});
    expect(screen.getByText('Member Selection')).toBeInTheDocument();
    expect(screen.getByText('Users (2)')).toBeInTheDocument();
    expect(screen.getByText('Groups (1)')).toBeInTheDocument();

    // Check that user table is visible
    expect(screen.getByTestId('mock-table-SelectUsers')).toBeInTheDocument();
    expect(screen.getByText('User One')).toBeInTheDocument();

    // Check that group table is hidden (TabPanel unmounts it)
    expect(
      screen.queryByTestId('mock-table-SelectGroups'),
    ).not.toBeInTheDocument();
  });

  it('switches to the "Groups" tab and displays groups', async () => {
    renderDialog({});

    // Check that "Groups" tab is not yet active
    expect(
      screen.queryByTestId('mock-table-SelectGroups'),
    ).not.toBeInTheDocument();

    // Click the "Groups" tab
    fireEvent.click(screen.getByText('Groups (1)'));

    // Check that group table is now visible
    expect(
      await screen.findByTestId('mock-table-SelectGroups'),
    ).toBeInTheDocument();
    expect(screen.getByText('Group One')).toBeInTheDocument();

    // Check that user table is now hidden
    expect(
      screen.queryByTestId('mock-table-SelectUsers'),
    ).not.toBeInTheDocument();
  });

  it('calls onClose when the "Cancel" button is clicked', () => {
    const mockOnClose = jest.fn();
    renderDialog({ onClose: mockOnClose });

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the "X" icon button is clicked', () => {
    const mockOnClose = jest.fn();
    renderDialog({ onClose: mockOnClose });

    fireEvent.click(screen.getByLabelText('close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('pre-selects users and groups based on initialSelectedMembers', () => {
    // We need to create a mock SelectedMember that matches the conversion
    const mockSelectedUser = {
      id: 'etag-user1',
      label: 'User One',
      ref: 'user:default/user1',
      type: 'User',
    } as any;

    renderDialog({ initialSelectedMembers: [mockSelectedUser] });

    // Check User 1 row
    const user1Row = screen.getByTestId('row-user1');
    expect(within(user1Row).getByText('checked')).toBeInTheDocument();

    // Check User 2 row
    const user2Row = screen.getByTestId('row-user2');
    expect(within(user2Row).getByText('not-checked')).toBeInTheDocument();
  });

  it('calls onApply with the correct combined selection', () => {
    const mockOnApply = jest.fn();
    renderDialog({ onApply: mockOnApply });

    // 1. User tab is active by default. Simulate selecting User 2
    act(() => {
      capturedUserSelectionChange([mockUser2]);
    });

    // 2. Switch to Groups tab
    fireEvent.click(screen.getByText('Groups (1)'));

    // 3. Simulate selecting Group 1
    act(() => {
      capturedGroupSelectionChange([mockGroup1]);
    });

    // 4. Click Apply
    fireEvent.click(screen.getByText('Apply Selection'));

    // 5. Verify the onApply callback
    expect(mockOnApply).toHaveBeenCalledTimes(1);

    // Check that the payload contains the correct *formatted* objects
    const expectedPayload = [
      expect.objectContaining({
        ref: 'user:default/user2',
        label: 'User Two',
      }),
      expect.objectContaining({
        ref: 'group:default/group1',
        label: 'Group One',
      }),
    ];
    expect(mockOnApply).toHaveBeenCalledWith(
      expect.arrayContaining(expectedPayload),
    );
    // Ensure no other items are in the array
    expect(mockOnApply.mock.calls[0][0].length).toBe(2);
  });
});
