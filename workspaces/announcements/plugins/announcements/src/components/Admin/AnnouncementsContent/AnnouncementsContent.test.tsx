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

import { screen, waitFor } from '@testing-library/react';
import { AnnouncementsContent } from './AnnouncementsContent';
import {
  mockApis,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { AnnouncementsList } from '@backstage-community/plugin-announcements-common';
import { DateTime } from 'luxon';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { userEvent } from '@testing-library/user-event';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { alertApiRef } from '@backstage/core-plugin-api';

const mockAlertApi = {
  post: jest.fn(),
  alert$: jest.fn(),
};

const mockAnnouncementsApi = (announcements: AnnouncementsList) => ({
  announcements: jest.fn().mockResolvedValue(announcements),
  updateAnnouncement: jest.fn().mockResolvedValue({}),
  createCategory: jest.fn().mockResolvedValue({}),
  categories: jest.fn().mockResolvedValue([]),
  tags: jest.fn().mockResolvedValue([]),
});

type RenderAnnouncementsContentProps = {
  announcements: AnnouncementsList;
  defaultInactive?: boolean;
};

const mockCatalogApi = {
  getEntities: async () => ({ items: [] }),
};

const renderAnnouncementsContent = async ({
  announcements,
  defaultInactive,
}: RenderAnnouncementsContentProps) => {
  const api = mockAnnouncementsApi(announcements);
  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, api],
        [alertApiRef, mockAlertApi],
        [permissionApiRef, mockApis.permission()],
        [catalogApiRef, mockCatalogApi],
      ]}
    >
      <AnnouncementsContent defaultInactive={defaultInactive} />
    </TestApiProvider>,
  );
  return api;
};

describe('AnnouncementsContent', () => {
  afterEach(() => {
    jest.resetAllMocks();
    mockAlertApi.post.mockClear();
  });

  it('renders no announcements text', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
    });
    expect(screen.getByText(/No announcements found/i)).toBeInTheDocument();
  });

  it('renders "Create Announcement" button', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
    });
    expect(screen.getByText(/Create Announcement/i)).toBeInTheDocument();
  });

  it('renders announcement list in the table', async () => {
    const announcementsList: AnnouncementsList = {
      count: 2,
      results: [
        {
          id: '1',
          title: 'Test Announcement 1',
          excerpt: 'Test Excerpt 1',
          body: 'Test Body 1',
          publisher: 'Test Publisher 1',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: true,
          start_at: DateTime.now().toISO(),
          until_date: DateTime.now().plus({ days: 7 }).toISO(),
        },
        {
          id: '2',
          title: 'Test Announcement 2',
          excerpt: 'Test Excerpt 2',
          body: 'Test Body 2',
          publisher: 'Test Publisher 2',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: false,
          start_at: DateTime.now().toISO(),
          until_date: DateTime.now().plus({ days: 7 }).toISO(),
        },
      ],
    };

    await renderAnnouncementsContent({ announcements: announcementsList });

    announcementsList.results.forEach(a => {
      expect(screen.getByText(a.title)).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(a.publisher, 'i')),
      ).toBeInTheDocument();
    });
  });

  it('renders AnnouncementForm with "active" switch checked by default', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
    });
    await userEvent.click(screen.getByText(/Create Announcement/i));
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
  });

  it('renders AnnouncementForm with "active" switch unchecked if defaultInactive flag is true', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
      defaultInactive: true,
    });
    await userEvent.click(screen.getByText(/Create Announcement/i));
    expect(screen.getByRole('checkbox', { name: 'Active' })).not.toBeChecked();
  });

  describe('edit announcement', () => {
    const testAnnouncement = {
      id: '1',
      title: 'Test Announcement',
      excerpt: 'Test Excerpt',
      body: 'Test Body',
      publisher: 'user:default/test-user',
      created_at: DateTime.now().toISO(),
      updated_at: DateTime.now().toISO(),
      active: true,
      start_at: DateTime.now().toISO(),
      until_date: DateTime.now().plus({ days: 7 }).toISO(),
    };

    it('shows edit form when edit button is clicked', async () => {
      await renderAnnouncementsContent({
        announcements: { count: 1, results: [testAnnouncement] },
      });

      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toBeInTheDocument();
      await userEvent.click(editButton!);

      await waitFor(() => {
        // Check for the header "Edit announcement" (h6)
        const headers = screen.getAllByText(/Edit announcement/i);
        expect(headers.length).toBeGreaterThan(0);
        // Also verify the form input is present with the announcement data
        const titleInputs = screen.getAllByLabelText(
          /Title/i,
        ) as HTMLInputElement[];
        const editFormInput = titleInputs.find(
          input => input.value === testAnnouncement.title,
        );
        expect(editFormInput).toBeDefined();
      });
    });

    it('populates edit form with announcement data', async () => {
      await renderAnnouncementsContent({
        announcements: { count: 1, results: [testAnnouncement] },
      });

      const editButton = screen.getByTestId('edit-icon').closest('button');
      await userEvent.click(editButton!);

      await waitFor(() => {
        // Get all title inputs and find the one with the announcement title
        const titleInputs = screen.getAllByLabelText(
          /Title/i,
        ) as HTMLInputElement[];
        const editFormInput = titleInputs.find(
          input => input.value === testAnnouncement.title,
        );
        expect(editFormInput).toBeDefined();
        expect(editFormInput!.value).toBe(testAnnouncement.title);
      });
    });

    it('calls updateAnnouncement when form is submitted', async () => {
      const api = await renderAnnouncementsContent({
        announcements: { count: 1, results: [testAnnouncement] },
      });

      const editButton = screen.getByTestId('edit-icon').closest('button');
      await userEvent.click(editButton!);

      await waitFor(() => {
        // Verify edit form is visible by checking for title input with announcement data
        const titleInputs = screen.getAllByLabelText(
          /Title/i,
        ) as HTMLInputElement[];
        const editFormInput = titleInputs.find(
          input => input.value === testAnnouncement.title,
        );
        expect(editFormInput).toBeDefined();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(api.updateAnnouncement).toHaveBeenCalledWith(
          testAnnouncement.id,
          expect.objectContaining({
            title: testAnnouncement.title,
          }),
        );
      });
    });

    it('hides edit form when cancel button is clicked', async () => {
      await renderAnnouncementsContent({
        announcements: { count: 1, results: [testAnnouncement] },
      });

      const editButton = screen.getByTestId('edit-icon').closest('button');
      await userEvent.click(editButton!);

      await waitFor(() => {
        // Verify edit form is visible
        const titleInputs = screen.getAllByLabelText(
          /Title/i,
        ) as HTMLInputElement[];
        const editFormInput = titleInputs.find(
          input => input.value === testAnnouncement.title,
        );
        expect(editFormInput).toBeDefined();
      });

      // Find the cancel button in the edit form header (not the form's cancel)
      const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
      const headerCancelButton = cancelButtons.find(btn =>
        btn.textContent?.includes('Cancel'),
      );
      expect(headerCancelButton).toBeInTheDocument();
      await userEvent.click(headerCancelButton!);

      await waitFor(() => {
        // Verify edit form is hidden - title input with announcement data should be gone
        const titleInputs = screen.queryAllByLabelText(
          /Title/i,
        ) as HTMLInputElement[];
        const editFormInput = titleInputs.find(
          input => input.value === testAnnouncement.title,
        );
        expect(editFormInput).toBeUndefined();
      });
    });

    it('hides create form when edit button is clicked', async () => {
      await renderAnnouncementsContent({
        announcements: { count: 1, results: [testAnnouncement] },
      });

      // Show create form
      await userEvent.click(screen.getByText(/Create Announcement/i));
      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', { name: 'Active' }),
        ).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByTestId('edit-icon').closest('button');
      await userEvent.click(editButton!);

      // Create form should be hidden - check that the create form's "New announcement" heading is gone
      await waitFor(() => {
        // The create form has "New announcement" heading, edit form has "Edit announcement"
        // We should not see "New announcement" anymore
        expect(screen.queryByText(/New announcement/i)).not.toBeInTheDocument();
      });

      // Edit form should be visible
      await waitFor(() => {
        const titleInputs = screen.getAllByLabelText(
          /Title/i,
        ) as HTMLInputElement[];
        const editFormInput = titleInputs.find(
          input => input.value === testAnnouncement.title,
        );
        expect(editFormInput).toBeDefined();
        expect(editFormInput!.value).toBe(testAnnouncement.title);
      });
    });

    it('disables edit button for announcement being edited', async () => {
      await renderAnnouncementsContent({
        announcements: { count: 1, results: [testAnnouncement] },
      });

      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).not.toBeDisabled();

      await userEvent.click(editButton!);

      // Re-query the button after state change to get updated disabled state
      await waitFor(() => {
        const updatedEditButton = screen
          .getByTestId('edit-icon')
          .closest('button');
        expect(updatedEditButton).toBeDisabled();
      });
    });
  });
});
