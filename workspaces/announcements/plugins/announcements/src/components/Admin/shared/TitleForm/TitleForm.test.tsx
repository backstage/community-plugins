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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAnnouncementsPermissions } from '@backstage-community/plugin-announcements-react';
import { TitleForm, TitleFormRequest } from './TitleForm';

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  useAnnouncementsPermissions: jest.fn(),
}));

const mockUseAnnouncementsPermissions =
  useAnnouncementsPermissions as jest.MockedFunction<
    typeof useAnnouncementsPermissions
  >;

const defaultTranslationKeys = {
  new: 'New Item',
  edit: 'Edit Item',
  titleLabel: 'Title',
  submit: 'Submit',
};

describe('TitleForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnnouncementsPermissions.mockReturnValue({
      create: {
        loading: false,
        allowed: true,
      },
      delete: {
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

  describe('Rendering', () => {
    it('should render form with default test IDs when testIds not provided', () => {
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByTestId('title-form')).toBeInTheDocument();
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByTestId('title-submit-button')).toBeInTheDocument();
    });

    it('should render form with custom test IDs when provided', () => {
      const customTestIds = {
        form: 'custom-form',
        input: 'custom-input',
        button: 'custom-button',
      };

      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
          testIds={customTestIds}
        />,
      );

      expect(screen.getByTestId('custom-form')).toBeInTheDocument();
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('should show "new" title when initialData is not provided', () => {
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('New Item')).toBeInTheDocument();
    });

    it('should show "new" title when initialData has empty title', () => {
      render(
        <TitleForm<TitleFormRequest>
          initialData={{ title: '' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('New Item')).toBeInTheDocument();
    });

    it('should show "edit" title when initialData has title', () => {
      render(
        <TitleForm<TitleFormRequest>
          initialData={{ title: 'Existing Title' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('Edit Item')).toBeInTheDocument();
    });

    it('should render TextField with correct label', () => {
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should render submit button with correct text', () => {
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Submit' }),
      ).toBeInTheDocument();
    });
  });

  describe('Form Input', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test Title');

      expect(input).toHaveValue('Test Title');
    });

    it('should initialize with empty title when initialData is not provided', () => {
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should initialize with initialData title when provided', () => {
      render(
        <TitleForm<TitleFormRequest>
          initialData={{ title: 'Initial Title' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Initial Title');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when form is submitted', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(input, 'New Title');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({ title: 'New Title' });
      });
    });

    it('should call onSubmit with initialData when form is submitted without changes', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <TitleForm<TitleFormRequest>
          initialData={{ title: 'Existing Title' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({ title: 'Existing Title' });
      });
    });
  });

  describe('Button Disabled State', () => {
    it('should disable button when title is empty', () => {
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable button when title is provided', async () => {
      const user = userEvent.setup();
      render(
        <TitleForm<TitleFormRequest>
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      expect(submitButton).toBeDisabled();

      await user.type(input, 'Test Title');

      expect(submitButton).not.toBeDisabled();
    });

    it('should disable button when permissions are loading', () => {
      mockUseAnnouncementsPermissions.mockReturnValue({
        create: {
          loading: true,
          allowed: true,
        },
        delete: {
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
        <TitleForm<TitleFormRequest>
          initialData={{ title: 'Test Title' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeDisabled();
    });

    it('should disable button when create permission is not allowed', () => {
      mockUseAnnouncementsPermissions.mockReturnValue({
        create: {
          loading: false,
          allowed: false,
        },
        delete: {
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
        <TitleForm<TitleFormRequest>
          initialData={{ title: 'Test Title' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeDisabled();
    });

    it('should disable button during form submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      render(
        <TitleForm<TitleFormRequest>
          initialData={{ title: 'Test Title' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();

      resolveSubmit!();
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should enable button when title is provided and permissions are allowed', () => {
      mockUseAnnouncementsPermissions.mockReturnValue({
        create: {
          loading: false,
          allowed: true,
        },
        delete: {
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
        <TitleForm<TitleFormRequest>
          initialData={{ title: 'Test Title' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Generic Type Support', () => {
    it('should work with different types that extend TitleFormRequest', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      type ExtendedData = TitleFormRequest & {
        extraField?: string;
      };

      render(
        <TitleForm<ExtendedData>
          initialData={{ title: 'Test', extraField: 'extra' }}
          translationKeys={defaultTranslationKeys}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test',
          extraField: 'extra',
        });
      });
    });
  });
});
