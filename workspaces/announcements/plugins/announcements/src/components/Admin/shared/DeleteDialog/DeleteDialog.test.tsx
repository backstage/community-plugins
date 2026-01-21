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
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { useAnnouncementsPermissions } from '@backstage-community/plugin-announcements-react';
import { DeleteDialog } from './DeleteDialog';

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  useAnnouncementsTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'confirmDeleteDialog.title': 'Confirm Delete',
        'confirmDeleteDialog.cancel': 'Cancel',
        'confirmDeleteDialog.delete': 'Delete',
      };
      return translations[key] || key;
    },
  }),
  useAnnouncementsPermissions: jest.fn(),
}));

const mockUseAnnouncementsPermissions =
  useAnnouncementsPermissions as jest.MockedFunction<
    typeof useAnnouncementsPermissions
  >;

describe('DeleteDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnnouncementsPermissions.mockReturnValue({
      delete: {
        loading: false,
        allowed: true,
      },
      create: {
        loading: false,
        allowed: false,
      },
      update: {
        loading: false,
        allowed: false,
      },
      settingsUpdate: {
        loading: false,
        allowed: false,
      },
      isLoading: false,
    });
  });

  it('should render dialog when isOpen is true', () => {
    render(
      <DeleteDialog isOpen onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
    );

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not render dialog when isOpen is false', () => {
    render(
      <DeleteDialog
        isOpen={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(
      <DeleteDialog isOpen onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when delete button is clicked', async () => {
    render(
      <DeleteDialog isOpen onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await userEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should disable delete button when permissions are loading', () => {
    mockUseAnnouncementsPermissions.mockReturnValue({
      delete: {
        loading: true,
        allowed: true,
      },
      create: {
        loading: false,
        allowed: false,
      },
      update: {
        loading: false,
        allowed: false,
      },
      settingsUpdate: {
        loading: false,
        allowed: false,
      },
      isLoading: true,
    });

    render(
      <DeleteDialog isOpen onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeDisabled();
  });

  it('should disable delete button when delete permission is not allowed', () => {
    mockUseAnnouncementsPermissions.mockReturnValue({
      delete: {
        loading: false,
        allowed: false,
      },
      create: {
        loading: false,
        allowed: false,
      },
      update: {
        loading: false,
        allowed: false,
      },
      settingsUpdate: {
        loading: false,
        allowed: false,
      },
      isLoading: false,
    });

    render(
      <DeleteDialog isOpen onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeDisabled();
  });

  it('should enable delete button when permissions are allowed and not loading', () => {
    mockUseAnnouncementsPermissions.mockReturnValue({
      delete: {
        loading: false,
        allowed: true,
      },
      create: {
        loading: false,
        allowed: false,
      },
      update: {
        loading: false,
        allowed: false,
      },
      settingsUpdate: {
        loading: false,
        allowed: false,
      },
      isLoading: false,
    });

    render(
      <DeleteDialog isOpen onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).not.toBeDisabled();
  });

  it('should call onCancel when dialog is closed via backdrop click', async () => {
    render(
      <DeleteDialog isOpen onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
    );

    // Simulate onClose by clicking the backdrop and verifying the callback is called.
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement;

    expect(backdrop).toBeTruthy();
    await userEvent.click(backdrop!);
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
