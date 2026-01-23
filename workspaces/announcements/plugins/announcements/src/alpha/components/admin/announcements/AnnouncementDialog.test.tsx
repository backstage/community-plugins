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

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { identityApiRef } from '@backstage/core-plugin-api';
import { DateTime } from 'luxon';

import {
  AnnouncementDialog,
  AnnouncementDialogProps,
} from './AnnouncementDialog';

// Helper to get the title input field (first textbox in the form)
const getTitleInput = () => {
  const textFields = screen.getAllByRole('textbox');
  return textFields[0] as HTMLInputElement;
};

const mockAnnouncementsApi = {
  announcements: jest.fn().mockResolvedValue({ count: 0, results: [] }),
  categories: jest.fn().mockResolvedValue([]),
  tags: jest.fn().mockResolvedValue([]),
};

const mockCatalogApi = {
  getEntities: jest.fn().mockResolvedValue({ items: [] }),
};

const mockIdentityApi = {
  getBackstageIdentity: jest.fn().mockResolvedValue({
    userEntityRef: 'user:default/guest',
    ownershipEntityRefs: [],
  }),
};

const renderAnnouncementDialog = async (
  props: Partial<AnnouncementDialogProps> = {},
) => {
  const defaultProps: AnnouncementDialogProps = {
    open: true,
    onSubmit: jest.fn().mockResolvedValue(undefined),
    onCancel: jest.fn(),
    ...props,
  };

  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi],
        [catalogApiRef, mockCatalogApi],
        [identityApiRef, mockIdentityApi],
      ]}
    >
      <AnnouncementDialog {...defaultProps} />
    </TestApiProvider>,
  );

  return defaultProps;
};

describe('AnnouncementDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dialog header', () => {
    it('renders "New announcement" title when creating', async () => {
      await renderAnnouncementDialog({ open: true });

      expect(screen.getByText(/New announcement/i)).toBeInTheDocument();
    });

    it('renders "Edit announcement" title when editing', async () => {
      const existingAnnouncement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'user:default/test-user',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementDialog({
        open: true,
        initialData: existingAnnouncement,
      });

      expect(screen.getByText(/Edit announcement/i)).toBeInTheDocument();
    });
  });

  describe('submit button state', () => {
    it('submit button is disabled when title is empty', async () => {
      await renderAnnouncementDialog({ open: true });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      expect(submitButton).toBeDisabled();
    });

    it('submit button is disabled when canSubmit is false', async () => {
      const existingAnnouncement: Announcement = {
        id: '1',
        title: 'Test Announcement',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'user:default/test-user',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementDialog({
        open: true,
        initialData: existingAnnouncement,
        canSubmit: false,
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('form interactions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const onCancel = jest.fn();
      await renderAnnouncementDialog({ open: true, onCancel });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit with form data when submit is clicked', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      await renderAnnouncementDialog({ open: true, onSubmit });

      // Fill in the title field (required)
      const titleInput = getTitleInput();
      await userEvent.type(titleInput, 'New Test Announcement');

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Test Announcement',
          }),
        );
      });
    });

    it('populates form with initialData when editing', async () => {
      const existingAnnouncement: Announcement = {
        id: '1',
        title: 'Existing Announcement',
        excerpt: 'Existing Excerpt',
        body: 'Existing Body',
        publisher: 'user:default/test-user',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: true,
        start_at: DateTime.now().toISO(),
      };

      await renderAnnouncementDialog({
        open: true,
        initialData: existingAnnouncement,
      });

      await waitFor(() => {
        const titleInput = getTitleInput();
        expect(titleInput.value).toBe('Existing Announcement');
      });
    });
  });

  describe('dialog visibility', () => {
    it('does not render dialog content when open is false', async () => {
      await renderAnnouncementDialog({ open: false });

      expect(screen.queryByText(/New announcement/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Submit/i }),
      ).not.toBeInTheDocument();
    });
  });
});
