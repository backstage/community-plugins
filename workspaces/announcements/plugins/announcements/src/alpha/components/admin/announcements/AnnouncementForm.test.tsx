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

import { AnnouncementForm } from './AnnouncementForm';

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

type RenderAnnouncementFormProps = {
  initialData?: Announcement;
  onFormChange?: jest.Mock;
};

const renderAnnouncementForm = async ({
  initialData,
  onFormChange = jest.fn(),
}: RenderAnnouncementFormProps = {}) => {
  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi],
        [catalogApiRef, mockCatalogApi],
        [identityApiRef, mockIdentityApi],
      ]}
    >
      <AnnouncementForm initialData={initialData} onFormChange={onFormChange} />
    </TestApiProvider>,
  );

  return { onFormChange };
};

// Helper to get form fields by their label text within the form
const getTitleInput = () => {
  // The title input is a textbox with a label containing "Title"
  const textFields = screen.getAllByRole('textbox');
  // Find the one that is associated with "Title" label (first TextField)
  return textFields[0] as HTMLInputElement;
};

const getExcerptInput = () => {
  return screen.getByRole('textbox', { name: /Excerpt/i }) as HTMLInputElement;
};

describe('AnnouncementForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('form fields', () => {
    it('renders title field', async () => {
      await renderAnnouncementForm();

      // Check that the Title label exists
      expect(screen.getByText('Title')).toBeInTheDocument();
      // Check that there's a textbox for title
      const titleInput = getTitleInput();
      expect(titleInput).toBeInTheDocument();
    });

    it('renders excerpt field', async () => {
      await renderAnnouncementForm();

      expect(screen.getByText('Excerpt')).toBeInTheDocument();
    });

    it('renders body/details field', async () => {
      await renderAnnouncementForm();

      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('renders start date field', async () => {
      await renderAnnouncementForm();

      expect(
        screen.getByLabelText(/Announcement start date/i),
      ).toBeInTheDocument();
    });

    it('renders until date field', async () => {
      await renderAnnouncementForm();

      // The translation for untilDate is "Announcement end date"
      expect(
        screen.getByLabelText(/Announcement end date/i),
      ).toBeInTheDocument();
    });

    it('renders active switch', async () => {
      await renderAnnouncementForm();

      expect(screen.getByLabelText(/Active/i)).toBeInTheDocument();
    });

    it('renders send notification switch', async () => {
      await renderAnnouncementForm();

      expect(screen.getByLabelText(/Send notification/i)).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('renders "active" switch checked by default', async () => {
      await renderAnnouncementForm();

      const activeSwitch = screen.getByLabelText(/Active/i);
      expect(activeSwitch).toBeChecked();
    });

    it('renders "send notification" switch checked by default', async () => {
      await renderAnnouncementForm();

      const sendNotificationSwitch =
        screen.getByLabelText(/Send notification/i);
      expect(sendNotificationSwitch).toBeChecked();
    });
  });

  describe('initialData', () => {
    it('populates form with initial data when provided', async () => {
      const initialData: Announcement = {
        id: '1',
        title: 'Test Title',
        excerpt: 'Test Excerpt',
        body: 'Test Body',
        publisher: 'user:default/test-user',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
        active: false,
        start_at: '2026-01-15',
      };

      await renderAnnouncementForm({ initialData });

      await waitFor(() => {
        const titleInput = getTitleInput();
        expect(titleInput.value).toBe('Test Title');
      });

      const excerptInput = getExcerptInput();
      expect(excerptInput.value).toBe('Test Excerpt');

      const activeSwitch = screen.getByLabelText(/Active/i);
      expect(activeSwitch).not.toBeChecked();
    });

    it('renders active switch unchecked when initial value is false', async () => {
      const initialData = { active: false } as Announcement;
      await renderAnnouncementForm({ initialData });

      await waitFor(() => {
        const activeSwitch = screen.getByLabelText(/Active/i);
        expect(activeSwitch).not.toBeChecked();
      });
    });

    it('renders active switch checked when initial value is true', async () => {
      const initialData = { active: true } as Announcement;
      await renderAnnouncementForm({ initialData });

      await waitFor(() => {
        const activeSwitch = screen.getByLabelText(/Active/i);
        expect(activeSwitch).toBeChecked();
      });
    });
  });

  describe('onFormChange callback', () => {
    it('calls onFormChange when title changes', async () => {
      const onFormChange = jest.fn();
      await renderAnnouncementForm({ onFormChange });

      const titleInput = getTitleInput();
      await userEvent.type(titleInput, 'New Title');

      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Title',
          }),
        );
      });
    });

    it('calls onFormChange when active switch is toggled', async () => {
      const onFormChange = jest.fn();
      await renderAnnouncementForm({ onFormChange });

      const activeSwitch = screen.getByLabelText(/Active/i);
      await userEvent.click(activeSwitch);

      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            active: false,
          }),
        );
      });
    });

    it('calls onFormChange when send notification switch is toggled', async () => {
      const onFormChange = jest.fn();
      await renderAnnouncementForm({ onFormChange });

      const sendNotificationSwitch =
        screen.getByLabelText(/Send notification/i);
      await userEvent.click(sendNotificationSwitch);

      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            sendNotification: false,
          }),
        );
      });
    });

    it('calls onFormChange on initial render with default values', async () => {
      const onFormChange = jest.fn();
      await renderAnnouncementForm({ onFormChange });

      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '',
            active: true,
            sendNotification: true,
          }),
        );
      });
    });
  });
});
