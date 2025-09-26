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
import { useApi } from '@backstage/core-plugin-api';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockUseLanguage } from '../../test-utils/mockTranslations';
import DeleteRoleDialog from './DeleteRoleDialog';

jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: mockUseLanguage,
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('../ToastContext', () => ({
  useToast: () => ({ setToastMessage: jest.fn() }),
}));

describe('DeleteRoleDialog', () => {
  it('renders delete role dialog correctly with Delete button disabled when open', () => {
    render(
      <DeleteRoleDialog
        open
        closeDialog={jest.fn()}
        roleName="Test Role"
        propOptions={{ memberRefs: [], permissions: 0 }}
      />,
    );
    expect(screen.queryByText(/Delete this role?/i)).toBeInTheDocument();
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('does not render when not open', () => {
    const { queryByText } = render(
      <DeleteRoleDialog
        open={false}
        closeDialog={jest.fn()}
        roleName="Test Role"
        propOptions={{ memberRefs: [], permissions: 0 }}
      />,
    );
    expect(queryByText(/Delete this role?/i)).not.toBeInTheDocument();
  });

  it('enables the delete button when the role name is correctly entered', async () => {
    const user = userEvent.setup();
    render(
      <DeleteRoleDialog
        open
        closeDialog={jest.fn()}
        roleName="Test Role"
        propOptions={{ memberRefs: [], permissions: 0 }}
      />,
    );

    const input = screen
      .getAllByRole('textbox')
      .find(element => element.getAttribute('name') === 'delete-role');

    if (!input) {
      throw new Error('Input not found');
    }
    user.type(input, 'Test Role');

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it('shows an error when the deletion fails', async () => {
    const mockDeleteRole = jest.fn().mockResolvedValue({ status: 400 });
    const useApiMock = useApi as jest.Mock;
    useApiMock.mockReturnValue({
      getAssociatedPolicies: jest.fn(),
      getRoleConditions: jest.fn(),
      deleteRole: mockDeleteRole,
    });

    const user = userEvent.setup();
    render(
      <DeleteRoleDialog
        open
        closeDialog={jest.fn()}
        roleName="Test Role"
        propOptions={{ memberRefs: [], permissions: 0 }}
      />,
    );

    const input = screen
      .getAllByRole('textbox')
      .find(element => element.getAttribute('name') === 'delete-role');

    if (!input) {
      throw new Error('Input not found');
    }
    await user.type(input, 'Test Role');

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.queryByText(/Unable to delete the role/i),
      ).toBeInTheDocument();
    });
  });
});
