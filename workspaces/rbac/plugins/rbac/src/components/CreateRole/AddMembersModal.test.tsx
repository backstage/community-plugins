/*
 * Copyright 2026 The Backstage Authors
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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { AddMembersModal } from './AddMembersModal';

const mockSearchMembers = jest.fn();
const mockGetMemberNamespaces = jest.fn();

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: () => ({
    searchMembers: mockSearchMembers,
    getMemberNamespaces: mockGetMemberNamespaces,
  }),
}));

jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => 'en',
}));

describe('AddMembersModal', () => {
  const onClose = jest.fn();
  const onAdd = jest.fn();

  beforeEach(() => {
    mockGetMemberNamespaces.mockResolvedValue(['default', 'guests']);
    mockSearchMembers.mockResolvedValue({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'User',
          metadata: {
            name: 'omar',
            namespace: 'default',
            etag: 'etag-omar',
          },
          spec: { profile: { displayName: 'Omar Nguyen' } },
        },
      ],
      totalItems: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal content and adds selected members', async () => {
    const user = userEvent.setup();
    render(<AddMembersModal open onClose={onClose} onAdd={onAdd} />);

    expect(
      await screen.findByText('Add members and groups'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSearchMembers).toHaveBeenCalled();
    });

    expect(await screen.findByText('Omar Nguyen')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Type' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Namespace' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Members' }),
    ).toBeInTheDocument();

    // Row selection checkbox is labelled by the row header (name column).
    const checkbox = screen.getByRole('checkbox', { name: /Omar Nguyen/i });
    await user.click(checkbox);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Omar Nguyen',
          ref: 'user:default/omar',
        }),
      ]),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddMembersModal open onClose={onClose} onAdd={onAdd} />);

    await screen.findByText('Add members and groups');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('selects all visible rows on the page via the header checkbox', async () => {
    mockSearchMembers.mockResolvedValue({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'User',
          metadata: { name: 'omar', namespace: 'default', etag: 'etag-omar' },
          spec: { profile: { displayName: 'Omar Nguyen' } },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Group',
          metadata: {
            name: 'admins',
            namespace: 'default',
            etag: 'etag-admins',
          },
          spec: { profile: { displayName: 'admins' } },
        },
      ],
      totalItems: 25,
    });
    const user = userEvent.setup();
    render(<AddMembersModal open onClose={onClose} onAdd={onAdd} />);

    expect(await screen.findByText('Omar Nguyen')).toBeInTheDocument();
    expect(await screen.findByText('admins')).toBeInTheDocument();

    const selectAll = await screen.findByRole('checkbox', {
      name: 'Select all',
    });
    await user.click(selectAll);

    expect(await screen.findByText('2 selected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ ref: 'user:default/omar' }),
        expect.objectContaining({ ref: 'group:default/admins' }),
      ]),
    );
    expect(onAdd.mock.calls[0][0]).toHaveLength(2);
  });

  it('pre-checks members already selected when the modal reopens', async () => {
    render(
      <AddMembersModal
        open
        onClose={onClose}
        onAdd={onAdd}
        selectedMembers={[
          {
            label: 'Omar Nguyen',
            etag: 'etag-omar',
            type: 'User',
            namespace: 'default',
            ref: 'user:default/omar',
          },
        ]}
      />,
    );

    expect(await screen.findByText('Omar Nguyen')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox', { name: /Omar Nguyen/i });
    expect(checkbox).toBeChecked();
    expect(await screen.findByText('1 selected')).toBeInTheDocument();
  });

  it('adds selected members after opening a previously closed modal', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AddMembersModal open={false} onClose={onClose} onAdd={onAdd} />,
    );

    await waitFor(() => {
      expect(mockSearchMembers).toHaveBeenCalled();
    });

    rerender(<AddMembersModal open onClose={onClose} onAdd={onAdd} />);

    expect(await screen.findByText('Omar Nguyen')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox', { name: /Omar Nguyen/i });
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Omar Nguyen',
          ref: 'user:default/omar',
        }),
      ]),
    );
  });

  it('keeps previously added members checked after close and reopen', async () => {
    const user = userEvent.setup();
    mockSearchMembers.mockResolvedValue({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'User',
          metadata: { name: 'omar', namespace: 'default', etag: 'etag-omar' },
          spec: { profile: { displayName: 'Omar Nguyen' } },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'User',
          metadata: { name: 'alice', namespace: 'default', etag: 'etag-alice' },
          spec: { profile: { displayName: 'Alice' } },
        },
      ],
      totalItems: 2,
    });

    const selectedOmar = {
      label: 'Omar Nguyen',
      etag: 'etag-omar',
      type: 'User',
      namespace: 'default',
      ref: 'user:default/omar',
    };

    const { rerender } = render(
      <AddMembersModal
        open
        onClose={onClose}
        onAdd={onAdd}
        selectedMembers={[selectedOmar]}
      />,
    );

    expect(await screen.findByText('Omar Nguyen')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Omar Nguyen/i }),
    ).toBeChecked();

    // Close then reopen with the same in-form selection (no role save).
    rerender(
      <AddMembersModal
        open={false}
        onClose={onClose}
        onAdd={onAdd}
        selectedMembers={[selectedOmar]}
      />,
    );
    rerender(
      <AddMembersModal
        open
        onClose={onClose}
        onAdd={onAdd}
        selectedMembers={[selectedOmar]}
      />,
    );

    expect(await screen.findByText('Omar Nguyen')).toBeInTheDocument();
    expect(
      await screen.findByRole('checkbox', { name: /Omar Nguyen/i }),
    ).toBeChecked();
    expect(await screen.findByText('1 selected')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Alice/i }));
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ ref: 'user:default/omar' }),
        expect.objectContaining({ ref: 'user:default/alice' }),
      ]),
    );
  });

  it('omits unchecked members from onAdd so removals apply on edit', async () => {
    const user = userEvent.setup();
    mockSearchMembers.mockResolvedValue({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'User',
          metadata: { name: 'omar', namespace: 'default', etag: 'etag-omar' },
          spec: { profile: { displayName: 'Omar Nguyen' } },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'User',
          metadata: { name: 'alice', namespace: 'default', etag: 'etag-alice' },
          spec: { profile: { displayName: 'Alice' } },
        },
      ],
      totalItems: 2,
    });

    render(
      <AddMembersModal
        open
        onClose={onClose}
        onAdd={onAdd}
        selectedMembers={[
          {
            label: 'Omar Nguyen',
            etag: 'etag-omar',
            type: 'User',
            namespace: 'default',
            ref: 'user:default/omar',
          },
          {
            label: 'Alice',
            etag: 'etag-alice',
            type: 'User',
            namespace: 'default',
            ref: 'user:default/alice',
          },
        ]}
      />,
    );

    expect(await screen.findByText('2 selected')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /Omar Nguyen/i }));
    expect(await screen.findByText('1 selected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).toHaveBeenCalledWith([
      expect.objectContaining({ ref: 'user:default/alice' }),
    ]);
    expect(onAdd.mock.calls[0][0]).toHaveLength(1);
  });
});
